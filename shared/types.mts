import {type Asset, type  Order, Order_Type, type Position, Resolution, Side, type Trade, type User } from "../backend/src/generated/prisma/client.js";

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type ResolutionInfo = Map<Resolution, { symbol: string; duration: number }>;

export type OrderWithRequiredPrice = Prettify<Omit<Order, "price"> & { price: number }>;

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

export type PlaceOrder = {
	type: Order_Type;
	side: Side;
	assetId: Asset["id"];
	price?: number;
	quantity: number;
	leverage: number;
};

type ChannelsWithRequiredAsset = "orderbook" | "tradebook" | "fundingRate";
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

export type AccountMetrics = {
	usdc: number;
	orderMargin: number;
	initialMargin: number;
	maintenanceMargin: number;
	unpaidFunding: number;
};

export type UserIdentity = {
	name: User["name"],
	img_url: User["img_url"],
	id: User["id"],
}

export type AccountMetricsResponse = Prettify<
	AccountMetrics & {
		channel: "accountMetrics";
	}
>;

export type OrderbookDiffResponse = {
	channel: "orderbook";
	assetId: Asset["id"];
	side: Side;
	price: number;
	updatedAt: Date;
	changeInQuantity: number;
};

export type OrderDiffResponse = Prettify<Order & { channel: "openOrders" }>;

export type PositionDiffResponse = Prettify<Position & { channel: "positions" }>;

export type TradeResponse = {
	channel: "tradebook";
	id: Trade["id"];
	assetId: Asset["id"];
	price: number;
	quantity: number;
	createdAt: Date;
};

export type FundingRateResponse = {
	fundingRate: number
}

export type OrderMessage = {
	type: "order";
	action: "place" | "cancel";
	payload: CancelOrder | PlaceOrder;
};

export type SubscriptionMap = Prettify<
	{
		[K in ChannelsWithRequiredAsset]: {
			channel: K;
			assetId: Asset["id"];
		};
	} & {
		[K in ChannelsWithOptionalAsset]: {
			channel: K;
			assetId?: Asset["id"];
		};
	} & {
		[K in ChannelsWithoutAsset]: {
			channel: K;
		};
	}
>;

export type ResponseMessageMap = {
	orderbook: Array<OrderbookDiffResponse>;
	tradebook: Array<TradeResponse>;
	openOrders: Array<OrderDiffResponse>;
	positions: Array<PositionDiffResponse>;
	accountMetrics: AccountMetricsResponse;
	fundingRate: FundingRateResponse;
};

export type LoadStatus = "error" | "loading" | "ready";

export type Ready<T> = { status: "ready"; data: T };
export type Loading = { status: "loading" };
export type Err<T extends Error> = { status: "error"; error: T };

export type Loadable<T> = Ready<T> | Loading;
export type LoadableWithError<T, E extends Error> = Ready<T> | Loading | Err<E>;
export type Subscription = {
	[K in keyof SubscriptionMap]: SubscriptionMap[K];
}[Channel];

export type WsResponse = Prettify<
	{
		[K in Channel]: SubscriptionMap[K] & { message: ResponseMessageMap[K] };
	}[Channel]
>;

export type WsMessage = SubscriptionMessage | PlaceOrder;