import { getUser } from "../store/userStore.js";
import configData from "../../../shared/config.mjs";
import { getAllAssets } from "../store/assetStore.js";
import { executeOrderCancellation, placeOrder } from "../exchangeController.js";
import { getMarkPrice } from "../store/priceStore.js";
import { PlaceOrder } from "../../../shared/types.mjs";

const marketMakerId = configData.market_maker_id;
const marketMakerInterval = configData.market_maker_refresh_interval_ms;

export function initializeMarketMaker(){
    const user = getUser(marketMakerId);
    const offsetMultiplier = [0.002, 0.005, 0.0075, 0.01];
    const capitalSizes = [200000, 500000, 750000, 1000000];
    const assets = getAllAssets();
    setInterval(async ()=>{

        const orderIdList = Array.from(user.orders.keys());
        for(const orderId of orderIdList){
            await executeOrderCancellation(marketMakerId, orderId);
        }

        for(const asset of assets){
            const markPrice = getMarkPrice(asset.id);    

            for(let i=0;i<offsetMultiplier.length;i++){
                const offset = offsetMultiplier[i];
                const capSize = capitalSizes[i];

                const quantity = Math.ceil(capSize/markPrice);
                const bidPrice = markPrice*(1-offset);
                const askPrice = markPrice*(1+offset);

                const bidOrder: PlaceOrder = {
                    type: "LIMIT",
                    side: "BID",
                    assetId: asset.id,
                    price: bidPrice,
                    quantity,
                    leverage: 1,
                }

                const askOrder: PlaceOrder = {
                    type: "LIMIT",
                    side: "ASK",
                    assetId: asset.id,
                    price: askPrice,
                    quantity,
                    leverage: 1,
                }

                await placeOrder(bidOrder, marketMakerId);
                await placeOrder(askOrder, marketMakerId);
            }

        }
    }, marketMakerInterval)
} 