import { Asset, Position, Resolution, Side, User } from "@/generated/prisma";
import createRBTree from "functional-red-black-tree";
import { OrderWithRequiredPrice } from "../common/types";



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

// here non cash equity = IM of positions, due funding, pnl of positions
// here order margin = IM of open and partially fullfilled orders.
// here maintainence margin is

export type userWithoutPassword = Omit<User, "password">;

export type extendedUser = userWithoutPassword & {
	maintenanceMargin: number;
	InitialMargin: number;
	orderMargin: number;
};

export type UserWithPositionsAndOpenOrders = extendedUser & {
	positions: Map<Asset["id"], Position>;
} & { orders: Map<OrderWithRequiredPrice["id"], OrderWithRequiredPrice> };

export type LatestCandleByAssetAndResolution = Map<
	{ assetId: Asset["id"]; resolution: Resolution },
	Candle
>;
