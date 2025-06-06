import { Asset, Order, Order_Type, Position, Resolution, Side, Trade } from "@/generated/prisma";

export type ResolutionInfo = Map<Resolution, { symbol: string; duration: number }>;

type _OrderWithRequiredPrice = Omit<Order, "price"> & { price: number };
export type OrderWithRequiredPrice = {
	[K in keyof _OrderWithRequiredPrice]: _OrderWithRequiredPrice[K];
};

export type TradeLite = {
	id: Trade["id"];
	price: number;
	quantity: number;
	createdAt: Date;
};

export type OrderLite = {
	side: Side;
	price: number;
	quantity: number;
};

export type CumulativeOrderLite = OrderLite & {
	cumulativeQuantity: number;
};

export type HalfOrderBookLite = {
	side: Side;
	orders: CumulativeOrderLite[];
};

export type OrderBookLite = {
	lastOrderTimestamp: Date;
	askOrderbook: HalfOrderBookLite;
	bidOrderbook: HalfOrderBookLite;
};

export type CancelOrder = {
	orderId: Order["id"];
};

export type placeOrder = {
	type: Order_Type;
	side: Side;
	assetId: Asset["id"];
	price?: number;
	quantity: number;
	leverage: number;
};

export type SubscribeMessage = {
	type: "subscribe" | "unsubscribe";
	channel: Channel;
	assetId: Asset["id"];
};
// response types

export type ResponseMessageMap = {
	orderbook: OrderbookDiffResponse;
	tradebook: TradeResponse;
	openOrders: OrderDiffResponse;
	positions: PositionDiffResponse;
};

export type Channel = "orderbook" | "tradebook" | "openOrders" | "positions";

export type OrderbookDiffResponse = {
	channel: "orderbook";
	assetId: Asset["id"];
	side: Side;
	price: number;
	updatedAt: Date;
	changeInQuantity: number;
};

export type OrderDiffResponse = Order & { channel: "openOrders" };

export type PositionDiffResponse = PositionWithContractPrice & { channel: "positions" };

export type TradeResponse = {
	channel: "tradebook";
	id: Trade["id"];
	assetId: Asset["id"];
	price: number;
	quantity: number;
	createdAt: Date;
};

export type OrderMessage = {
	type: "order";
	action: "place" | "cancel";
	payload: CancelOrder | placeOrder;
};

export type WsResponse<P extends Channel = Channel> = {
	[K in P]: {
		assetId: string;
		channel: K;
		message: Array<ResponseMessageMap[K]>;
	};
}[P];

export type WsMessage = SubscribeMessage | placeOrder;

export type PositionWithPNL = Position & { pnl: number };

export type PositionWithContractPrice = Position & { contractPrice: number };
