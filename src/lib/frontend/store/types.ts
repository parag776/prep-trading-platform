import { Asset, Order, Position } from "@/generated/prisma";
import { TradeBook } from "../utils/tradebook";
import { AccountMetrics, AccountMetricsResponse, OrderbookDiffResponse, OrderBookLite, OrderDiffResponse, OrderWithRequiredPrice, PositionDiffResponse, Prettify, TradeResponse } from "@/lib/common/types";

export type TradebookSlice = {
    tradebook: TradeBook | null;
    ltp: number | null;
    fetchTradebook: (asset: Asset) => Promise<void>;
    updateTradebook: (updates: Array<TradeResponse>) => void;
};

export type PositionsSlice = {
    positions: Array<Position> | null;
    updatePositions: (updates: Array<PositionDiffResponse>) => void;
    fetchPositions: () => Promise<void>;
}

export type OrderSlice = {
    openOrders: Array<OrderWithRequiredPrice> | null;
    orderHistory: Array<Order> | null;
    updateOrders: (updates: Array<OrderDiffResponse>) => void;
    fetchOrders: () => Promise<void>;
};

export type OrderbookSlice = {
    orderbook: OrderBookLite | null;
    fetchOrderbook: (asset: Asset) => Promise<void>;
    updateOrderbook: (updates: Array<OrderbookDiffResponse>) => void;
};

export type MarkPriceSlice = {
	markPrices: Map<Asset["id"], number> | null;
	updateMarkPrice: (asset: Asset, price: number) => void;
	removeMarkPrice: (asset: Asset) => void;
	subscribeToMarkPrice: (asset: Asset) => void;
	unsubscribeToMarkPrice: (asset: Asset) => void;
    fetchMarkPrices: () => Promise<void>;
    syncMarkPriceConnectionsWithPositionUpdates: (updates: Array<PositionDiffResponse>) => void;
};

export type AssetSlice = {
    assetMap: Map<Asset["id"], Asset> | null;
    currentAsset: Asset | null;
    fetchAllAssets: () => Promise<void>;
    updateCurrentAsset: (assetId: Asset["id"]) => void;
    getAsset: (assetId: Asset["id"]) => Asset | null;
    getAssetBySymbol: (symbol: Asset["symbol"]) => Asset | null;
};

export type AccountMetricsSlice = Prettify<{accountMetrics: AccountMetrics | null} & {
    accountMetrics: null | AccountMetrics,
    fetchAccountMetrics: () => Promise<void>
    updateAccountMetrics: (update: AccountMetricsResponse) => void;
    addToBalance: (amount: number) => void;
    deposit: (amount: number) => Promise<void>;
    withdraw: (amount: number) => Promise<void>;
}>

export type DecimalPrecision = {
    price: number;
    quantity: number;
}

export type Store = Prettify<
  TradebookSlice &
  PositionsSlice &
  OrderSlice &
  OrderbookSlice &
  MarkPriceSlice &
  AssetSlice &
  AccountMetricsSlice
>;