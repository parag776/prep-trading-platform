// import {Asset, Order} from "@/generated/prisma"
// import seedrandom from "seedrandom";
// import { assets } from "./asset";
// import { fetchHttpSpotPrice } from "@/lib/backend/spotFetcher";

// async function generatePositions(){

//     const rng = seedrandom("my_not_so_random_seed")
//     const assetSpot = new Map<Asset["id"], number>();
    
//     for(const asset of assets){
//         assetSpot.set(asset.id, await fetchHttpSpotPrice(asset as Asset));
//     }

//     const orders = new Array<Order>();

//     for(let user of users){
//         let userBlockedMargin = 0;
//         for(let asset of assets){

//             // 50% of times no orders for the asset, and rest 50% of times 1-4 orders.
//             let count = rng()>0.5? Math.ceil(rng()*4):0;

//             const leverage = Math.ceil(rng()*config_data.leverage_max);

//             const spot = assetSpot.get(asset.id)!;

//             for(let i=0;i<count;i++){

//                 const orderMargin = Math.min(rng()*10000 + 10, user.usdc-userBlockedMargin)
//                 if(orderMargin===0) continue;

//                 userBlockedMargin+=orderMargin;

//                 const side = rng()>0.5 ? Side.BID : Side.ASK

//                 // from 0.5% to 3.5%
//                 const deltaFromSpot = (0.5 + rng()*3)*spot/100;

//                 let price = spot
//                 if(side===Side.ASK){
//                     price+=deltaFromSpot;
//                 } else {
//                     price-=deltaFromSpot;
//                 }

//                 // order Margin size in USDC
//                 // from 10 to 10010
//                 const quantity = orderMargin*leverage/((1+config_data.maker_fee)*price)

//                 const order = {
//                     id: uuid(),
//                     type: Order_Type.LIMIT,
//                     status: Order_Status.OPEN,
//                     side,
//                     price,
//                     quantity,
//                     filled_quantity: 0,
//                     average_filled_price: 0,
//                     assetId: asset.id,
//                     userId: user.id,
//                     leverage: rng()*100,
//                     createdAt: new Date(Date.now())
//                 }
//                 orders.push(order);
//             }

//         }
//     }
//     return orders;
// }

// i will seed positions a little later.