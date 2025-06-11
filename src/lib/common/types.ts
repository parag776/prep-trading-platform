import { Asset, Order, Order_Type, Position, Resolution, Side, Trade, User } from "@/generated/prisma";

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

type ChannelsWithRequiredAsset = "orderbook" | "tradebook";
type ChannelsWithOptionalAsset = "openOrders" | "positions";
type ChannelsWithoutAsset = "accountMetrics";

export type Channel = ChannelsWithRequiredAsset | ChannelsWithOptionalAsset | ChannelsWithoutAsset;

export type SubscriptionMessage =
	| {
			type: "subscribe" | "unsubscribe";
			channel: ChannelsWithRequiredAsset;
			assetId: Asset["id"];
	  }
	| {
			type: "subscribe" | "unsubscribe";
			channel: ChannelsWithOptionalAsset;
			assetId?: Asset["id"];
	  }
	| { type: "subscribe" | "unsubscribe"; channel: ChannelsWithoutAsset };

export type SubscriptionMessageWithUserId =
	| {
			type: "subscribe" | "unsubscribe";
			channel: ChannelsWithRequiredAsset;
			assetId: Asset["id"];
	  }
	| {
			type: "subscribe" | "unsubscribe";
			channel: ChannelsWithOptionalAsset;
			assetId?: Asset["id"];
			userId: User["id"];
	  }
	| {
			type: "subscribe" | "unsubscribe";
			channel: ChannelsWithoutAsset;
			userId: User["id"];
	  };

// response types

export type ResponseMessageMap = {
	orderbook: OrderbookDiffResponse;
	tradebook: TradeResponse;
	openOrders: OrderDiffResponse;
	positions: PositionDiffResponse;
	accountMetrics: AccountMetricsResponse;
};

export type AccountMetricsResponse = {
	channel: "accountMetrics";
	orderMargin: number;
	initialMargin: number;
	maintenanceMargin: number;
	unpaidFunding: number;
};

export type OrderbookDiffResponse = {
	channel: "orderbook";
	assetId: Asset["id"];
	side: Side;
	price: number;
	updatedAt: Date;
	changeInQuantity: number;
};

export type OrderDiffResponse = Order & { channel: "openOrders" };

export type PositionDiffResponse = Position & { channel: "positions" };

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

export type _WsResponse = {
	[K in ChannelsWithRequiredAsset]: {
		channel: K;
		assetId: Asset["id"];
		message: Array<ResponseMessageMap[K]>;
	};
} & {
	[K in ChannelsWithOptionalAsset]: {
		channel: K;
		assetId?: Asset["id"];
		message: Array<ResponseMessageMap[K]>;
	};
} & {
	[K in ChannelsWithoutAsset]: {
		channel: K;
		message: ResponseMessageMap[K];
	};
};

export type WsResponse = {
	[K in keyof _WsResponse]: _WsResponse[K];
}[Channel];
// export type WsResponse<P extends Channel = Channel> = {
// 	[K in P]: {
// 		assetId: string;
// 		channel: K;
// 		message: Array<ResponseMessageMap[K]>;
// 	};
// }[P];

export type WsMessage = SubscriptionMessage | placeOrder;
