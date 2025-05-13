import {
    Candle,
  extendedUser,
  HalfOrderBook,
  LatestCandleByAssetAndResolution,
  OrderBook,
  positionWithPNL,
  UserWithPositionsAndOpenOrders,
} from "./types";
import { v4 as uuid } from "uuid";
import {
  Asset,
  Order,
  PrismaClient,
  Side,
  Resolution,
  User,
  Order_Status,
} from "../../generated/prisma";
import { OrderWithRequiredPrice } from "./types";
import createRBTree from "functional-red-black-tree";
import { ResolutionInfo } from "../common/types";
import config from "../../../config.json"
import { calculateMaintenanceMargin, calculateMarginWithoutFee, calculateMarginWithFee, getContractPrice } from "./utils";

const prisma = new PrismaClient();

export let assets: Asset[];
export let orderbooks: Map<Asset["id"], OrderBook>;
export let latestCandles: LatestCandleByAssetAndResolution;
export let detailedUsersState: Map<User["id"], UserWithPositionsAndOpenOrders>;




async function getAssets() {
  return await prisma.asset.findMany();
}

async function getOrderbooks() {
  return new Map<Asset["id"], OrderBook>(
    await Promise.all(
      assets.map(async (asset: Asset) => {
        const orders = (await prisma.order.findMany({
          where: {
            status: {
              in: ["OPEN", "PARTIALLY_FILLED"],
            },
            asset,
          },
        })) as OrderWithRequiredPrice[];

        const askOrders = createRBTree<OrderWithRequiredPrice, null>(
          (key1: OrderWithRequiredPrice, key2: OrderWithRequiredPrice) => {
            if (key1.price === key2.price) {
              if (key1.createdAt < key2.createdAt) {
                return -1;
              } else if (key1.createdAt > key2.createdAt) {
                return 1;
              } else {
                return 0;
              }
            }
            if (key1.price < key2.price) {
              return -1;
            } else {
              return 1;
            }
          }
        );

        const bidOrders = createRBTree<OrderWithRequiredPrice, null>(
          (key1: OrderWithRequiredPrice, key2: OrderWithRequiredPrice) => {
            if (key1.price === key2.price) {
              if (key1.createdAt < key2.createdAt) {
                return -1;
              } else if (key1.createdAt > key2.createdAt) {
                return 1;
              } else {
                return 0;
              }
            }
            if (key1.price > key2.price) {
              // only difference in ask and bid is the comparison operator.
              return -1;
            } else {
              return 1;
            }
          }
        );

        for (let order of orders) {
          if (order.side === Side.ASK) {
            askOrders.insert(order, null);
          } else {
            bidOrders.insert(order, null);
          }
        }

        const askOrderbook: HalfOrderBook = {
          side: Side.ASK,
          orders: askOrders,
        };
        const bidOrderbook: HalfOrderBook = {
          side: Side.BID,
          orders: bidOrders,
        };

        const orderbook: OrderBook = {
          asset: asset.id,
          askOrderbook,
          bidOrderbook,
        };

        return [asset.id, orderbook] as [Asset["id"], OrderBook];
      })
    )
  );
}

async function getLatestCandles(){

    const latestCandles = new Map<{assetId: Asset["id"], resolution: Resolution}, Candle>();
    for(const asset of assets){

        for(const resolution of Object.values(Resolution)){
            const data = await prisma.historical_Data.findFirst({
                select: {
                    timestamp: true,
                    open: true,
                    high: true,
                    low: true,
                    close: true,
                    volume: true
                },
                where: {
                    assetId: asset.id,
                    resolution
                }
            })
            // creating a default candle, creating here and not outside, because of bugs it can cause (since heap alocated).
            const defaultCandle: Candle = {
                timestamp: new Date(0),
                open: 0,
                high: 0,
                low: Math.max(),
                close: 0,
                volume: 0
            }
            latestCandles.set({assetId: asset.id, resolution}, data || defaultCandle)
        }
    }
    return latestCandles;
}


// here non cash equity = IM of positions, due funding, pnl of positions
// export type UserWithPositionsAndOpenOrders = User & {
//   NonCashEquity: number;
//   maintenanceMargin: number;
//   orderMargin: number;
// } & (Position & { pnl: number })[] &
//   OrderWithRequiredPrice[];


async function getDetailedUsersState(){

    const usersWithPositions = await prisma.user.findMany({
        omit: {
            password: true,
        },
        include: {
            positions: true
        }
    });

    const detailedUsersState = new Map<User["id"], UserWithPositionsAndOpenOrders>();

    // make positions
    for(let user of usersWithPositions){

        const detailedUserState: UserWithPositionsAndOpenOrders = {
            ...user,
            nonCashEquity: 0,
            maintenanceMargin: 0,
            orderMargin: 0,
            positions: [],
            orders: [],
        }
        for(let position of user.positions){

            detailedUserState.nonCashEquity += calculateMarginWithoutFee(position.average_price, position.quantity, position.leverage)// initial margin
            detailedUserState.maintenanceMargin+=calculateMaintenanceMargin(position.average_price, position.quantity) // maintainance margin

            const pnl = (position.average_price - getContractPrice(position.assetId))*position.quantity;
            detailedUserState.nonCashEquity+=pnl;

            detailedUserState.positions.push({...position, pnl});
        }
        detailedUsersState.set(user.id, detailedUserState);
    }


    const orders = await prisma.order.findMany({
        where: {
            OR: [{status: Order_Status.OPEN}, {status: Order_Status.PARTIALLY_FILLED}]
        }
    });

    for(const order of orders){
        const extendedUser = detailedUsersState.get(order.userId)!;
        const remainingQuantity = order.quantity - (order.filled_quantity || 0);

        // since its order margin you should block fees also, bro you almost forgot it and could have included 
        // potentially a hazardous bug in your system.
        // this bug would have been so dangerous that, you could never have figured it out.
        extendedUser.orderMargin+=calculateMarginWithFee(remainingQuantity, order.price!, order.leverage, config.maker_fee);

        extendedUser.orders.push({...order, price: order.price!})
    }
    return detailedUsersState;
}

// include here
async function getInitialData() {
  
  assets = await getAssets();
  orderbooks = await getOrderbooks();
  latestCandles = await getLatestCandles();
  detailedUsersState = await getDetailedUsersState();
  


  //   orderbooks = new Map<Asset["id"], OrderBook>(orderbookEntities);

  // getting user information

  // getting positions
}
