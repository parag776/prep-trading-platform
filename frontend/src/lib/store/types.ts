import type { Asset, Order, Position } from "../../../../backend/src/generated/prisma";
import type { TradeBook } from "../utils/tradebook";
import type {
	AccountMetrics,
	AccountMetricsResponse,
	OrderbookDiffResponse,
	OrderBookLite,
	OrderDiffResponse,
	OrderWithRequiredPrice,
	PositionDiffResponse,
	Prettify,
	TradeResponse,
	UserIdentity,
} from "../../../../shared/types.mjs";

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
};

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
	initializePositionMarkPrices: () => Promise<void>;
	syncMarkPriceConnectionsWithPositionUpdates: (updates: Array<PositionDiffResponse>) => void;
};

export type AssetSlice = {
	fundingMap: Map<Asset["id"], number> | null;
	assetMap: Map<Asset["id"], Asset> | null;
	currentAsset: Asset | null;
	initializeAllAssets: () => Promise<void>;
	updateCurrentAsset: (assetId: Asset["id"]) => void;
	getAsset: (assetId: Asset["id"]) => Asset | null;
	getAssetBySymbol: (symbol: Asset["symbol"]) => Asset | null;
	updateFundingRate: (symbol: Asset["id"], fundingRate: number) => void
};

export type AccountSlice = Prettify<
	{ accountMetrics: AccountMetrics | null } & {
		accountMetrics: null | AccountMetrics;
		userIdentity: null | UserIdentity;
		fetchAccountMetrics: () => Promise<void>;
		fetchUserIdentity: () => Promise<void>;
		updateAccountMetrics: (update: AccountMetricsResponse) => void;
		addToBalance: (amount: number) => void;
		deposit: (amount: number) => Promise<void>;
		withdraw: (amount: number) => Promise<void>;
	}
>;

export type AuthSlice = {
	authenticationStatus: "loading" | "authenticated" | "unauthenticated";
	localRegister: (name: string, username: string, password: string) => Promise<void>;
	localSignIn: (username: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	verifyUserAuthenticationRemote: () => Promise<void>;
};

export type DecimalPrecision = {
	price: number;
	quantity: number;
};

export type Store = Prettify<TradebookSlice & PositionsSlice & OrderSlice & OrderbookSlice & MarkPriceSlice & AssetSlice & AccountSlice & AuthSlice>;
