import configData from "../../../shared/config.mjs";
import { getOrderbook } from "../store/orderbookStore.js";
import { Asset } from "../generated/prisma/index.js";
import { Orders } from "../types.js";
import { getMarkPrice } from "../store/priceStore.js";
import cron from 'node-cron';
import { getAllAssets } from "../store/assetStore.js";
import { addAccountMetricResponse, respondToFundingRateSubscribers } from "../webSocket/utils.js";
import { getAllUsers } from "../store/userStore.js";
import { databaseActions, runExchangeOperation } from "../exchangeController.js";
import { updateUserAfterFunding } from "../database.js";

const IMN = configData.impact_margin_notional;
const fundingInterval = configData.funding_interval_in_seconds;
const interestRate = configData.interest_rate;


function calculateImpactPrice(orders: Orders){
    let impactPrice = 0;
    let filled_quantity = 0; 
    let remainingQuantity = IMN;
    for(const order of orders.keys){

        const orderRemainingQuantity = order.quantity - order.filled_quantity;

        if(orderRemainingQuantity>=remainingQuantity){
            impactPrice = (impactPrice*filled_quantity + remainingQuantity*order.price)/(filled_quantity+remainingQuantity);
            filled_quantity+=remainingQuantity;
            remainingQuantity = 0;
            break;
        } else {
            impactPrice = (impactPrice*filled_quantity+orderRemainingQuantity*order.price)/(filled_quantity+orderRemainingQuantity);
            filled_quantity+=orderRemainingQuantity;
            remainingQuantity-=orderRemainingQuantity;
        }
    }
    return impactPrice || null;
}

function calculatePremiumIndex(assetId: Asset["id"]) {

    const orderbook = getOrderbook(assetId);
    const askOrders = orderbook.askOrderbook.orders;
    const bidOrders = orderbook.bidOrderbook.orders;

    const markPrice = getMarkPrice(assetId);

    const impactBidPrice = calculateImpactPrice(bidOrders) ?? markPrice;
    const impactAskPrice = calculateImpactPrice(askOrders) ?? markPrice;

    return (Math.max(0, impactBidPrice - markPrice) - Math.max(0, markPrice - impactAskPrice))/markPrice;

}

function clamp(value: number, lower: number, higher: number){
    if(value<=lower) return lower;
    if(value>=higher) return higher;
    return value;
}

export function initializeFundingMechanism(){

    const assets = getAllAssets();

    // base info.
    const fundingInfo = assets.map((asset)=>{
        return {
            averagePremuimIndex: 0,
            totalWeights: 0,
            fundingRate: interestRate,
        }
    })

    cron.schedule("0 * * * * *", async ()=>{
        const currentTimestampInSeconds = Math.floor(new Date().getTime()/1000);

        const secondsSinceLastFunding = (currentTimestampInSeconds%fundingInterval);
        const curWeight = secondsSinceLastFunding + 1;

        for(let i=0;i<assets.length;i++){

            if(secondsSinceLastFunding===0){
                // refresh fundingInfo
                fundingInfo[i] = {averagePremuimIndex: 0, totalWeights: 0, fundingRate: interestRate};
            }

            const asset = assets[i];

            let {averagePremuimIndex, totalWeights} = fundingInfo[i];

            const curPremiumIndex = calculatePremiumIndex(asset.id);
            averagePremuimIndex = (averagePremuimIndex*totalWeights + curPremiumIndex*curWeight)/(totalWeights+curWeight);
            const curFundingRate = averagePremuimIndex + clamp(interestRate - averagePremuimIndex, -0.05, 0.05);

            totalWeights+=curWeight;

            fundingInfo[i] = {averagePremuimIndex, totalWeights, fundingRate: curFundingRate};

            // ws response will be sent from here.
            respondToFundingRateSubscribers(curFundingRate, assets[i].id);
        }

        if(secondsSinceLastFunding === fundingInterval-1){

            await runExchangeOperation(()=>{
                for(let i=0;i<assets.length;i++){

                    const asset = assets[i];
                    const fundingRate = fundingInfo[i].fundingRate;

                    for(const [userId, user] of getAllUsers()){

                        const position = user.positions.get(asset.id);
                        if(position){
                            if(((fundingRate<0) && (position.side==="BID")) || ((fundingRate>=0) && (position.side==="ASK"))){ // will recieve usdc
                                user.usdc+=position.average_price*position.quantity*Math.abs(fundingRate);
                            } else { // will pay usdc

                                const fundingAmount = position.average_price*position.quantity*Math.abs(fundingRate);
                                if(user.usdc>=fundingAmount){
                                    user.usdc-=fundingAmount;
                                } else {
                                    user.funding_unpaid = fundingAmount-user.usdc;
                                    user.usdc = 0;
                                }
                            }
                        }
                        databaseActions.push(()=>updateUserAfterFunding(user));
                        addAccountMetricResponse(user);
                    }
                }
            })
        }

    });

}