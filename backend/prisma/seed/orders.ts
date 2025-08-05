// creating orders
import { assets } from "./asset.js";
import { users } from "./user.js";
import { Asset, Order, Order_Status, Order_Type, PrismaPromise, Side, User } from "../../src/generated/prisma/client.js";
import config_data from "../../../shared/config.mjs";
import seedrandom from 'seedrandom'
import prisma from "./prismaClient.js";
import {v4 as uuid} from "uuid";
import { fetchHttpSpotPrice } from "./utils.js";

async function generateOrders(orderCount: number){

    const rng = seedrandom("my_not_so_random_seed")
    const assetSpot = new Map<Asset["id"], number>();
    
    for(const asset of assets){
        assetSpot.set(asset.id, await fetchHttpSpotPrice(asset as Asset));
    }

    const orders = new Array<Order>();

    for(let user of users){
        let userBlockedMargin = 0;
        for(let asset of assets){

            // 50% of times no orders for the asset, and rest 50% of times 1-orderCount orders.
            let count = rng()>0.5? Math.ceil(rng()*orderCount):0;

            const leverage = Math.ceil(rng()*config_data.leverage_max);

            const spot = assetSpot.get(asset.id)!;

            for(let i=0;i<count;i++){

                const orderMargin = Math.min(rng()*10000 + 10, user.usdc-userBlockedMargin)
                if(orderMargin===0) continue;

                userBlockedMargin+=orderMargin;

                const side: Side = rng()>0.5 ? Side.BID : Side.ASK

                // from 0.5% to 3.5%
                const deltaFromSpot = (0.5 + rng()*3)*spot/100;

                let price = spot
                if(side===Side.ASK){
                    price+=deltaFromSpot;
                } else {
                    price-=deltaFromSpot;
                }

                // order Margin size in USDC
                // from 10 to 10010
                const quantity = orderMargin*leverage/((1+config_data.maker_fee)*price)

                const creationTime = Date.now()

                const order = {
                    id: uuid(),
                    type: Order_Type.LIMIT,
                    status: Order_Status.OPEN,
                    side,
                    price,
                    quantity,
                    filled_quantity: 0,
                    average_filled_price: 0,
                    assetId: asset.id,
                    userId: user.id,
                    leverage: rng()*100,
                    createdAt: new Date(creationTime),
                    updatedAt: new Date(creationTime)
                }
                orders.push(order);
            }

        }
    }
    return orders;
}

export async function fillOrders(seedingQueries: Array<()=>PrismaPromise<any>>){
    const orders = await generateOrders(300);
    seedingQueries.push(()=>prisma.order.createMany({
        data: orders,
    }));

}

// async function printOrders(){
//     const orders = (await generateOrders()).map((order=>{
//         const assetId = order.assetId;
//         const userId = order.userId;

//         const asset = assets.find(asset=>asset.id===assetId);
//         const user = users.find(user=>user.id===userId);

//         return {...order, symbol: asset?.symbol, email: user?.email};
//     }));
//     console.log(orders);
// }


// printOrders();

