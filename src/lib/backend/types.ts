import {
  Asset,
  Order,
  Position,
  Resolution,
  Side,
  User,
} from "@/generated/prisma";
import createRBTree from "functional-red-black-tree";

type _OrderWithRequiredPrice = Omit<Order, "price"> & { price: number };
export type OrderWithRequiredPrice = {
  [K in keyof _OrderWithRequiredPrice]: _OrderWithRequiredPrice[K];
};

export interface HalfOrderBook {
  side: Side;
  orders: createRBTree.Tree<OrderWithRequiredPrice, null>;
}

export interface OrderBook {
  asset: Asset["id"];
  askOrderbook: HalfOrderBook;
  bidOrderbook: HalfOrderBook;
}

export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// here non cash equity = IM of positions, due fee, due funding, pnl of positions
// here order margin = IM of open and partially fullfilled orders.
// here maintainence margin is

export type userWithoutPassword = Omit<User, "password">
export type positionWithPNL = Position & {pnl: number};

export type extendedUser = userWithoutPassword & {nonCashEquity: number, maintenanceMargin: number, orderMargin: number};

export type UserWithPositionsAndOpenOrders = extendedUser & {positions: positionWithPNL[]} &
  {orders: OrderWithRequiredPrice[]};


export type LatestCandleByAssetAndResolution = Map<{assetId: Asset["id"], resolution: Resolution}, Candle>;