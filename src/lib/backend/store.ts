import {
	Candle,
	extendedUser,
	HalfOrderBook,
	LatestCandleByAssetAndResolution,
	OrderBook,
	UserWithPositionsAndOpenOrders,
} from "./types";
import { Asset, PrismaClient, Side, Resolution, User, Order_Status, Position } from "../../generated/prisma";
import { OrderWithRequiredPrice } from "../common/types";
import createRBTree from "functional-red-black-tree";
import config from "../../../config.json";
import {
	calculateMaintenanceMargin,
	calculateMarginWithoutFee,
	calculateMarginWithFee,
	getContractPrice,
} from "./utils";
import { streamSpotPrices } from "./dataFetchers/spotFetcher";
import axios from "axios";
import { streamMarkPrices } from "./dataFetchers/markFetcher";

const prisma = new PrismaClient();

export let assets: Asset[];
export let symbolToAssetId: Map<Asset["symbol"], Asset["id"]>;
export let orderbooks: Map<Asset["id"], OrderBook>;
export let latestCandles: LatestCandleByAssetAndResolution;
export let detailedUsersState: Map<User["id"], UserWithPositionsAndOpenOrders>;
export let spotPrices: Map<Asset["id"], number>;
export let markPrices: Map<Asset["id"], number>;

async function getAssets() {
	assets = await prisma.asset.findMany();
	symbolToAssetId = new Map(assets.map((asset) => [asset.symbol, asset.id]));
}

async function getSpotPrices() {
	try {
		spotPrices = new Map(
			await Promise.all(
				assets.map(async (asset) => {
					const res = await axios.get(
						`https://api4.binance.com/api/v3/ticker/price?symbol=${asset.symbol}USDC`
					);
					return [asset.id, Number(res.data.price)] as [Asset["id"], number];
				})
			)
		);
	} catch (e) {
		spotPrices = new Map();
	}
}

async function getOrderbooks() {
	orderbooks = new Map<Asset["id"], OrderBook>(
		await Promise.all(
			assets.map(async (asset: Asset) => {
				const orders = (await prisma.order.findMany({
					where: {
						status: {
							in: ["OPEN"],
						},
						asset,
					},
				})) as OrderWithRequiredPrice[];

				let askOrders = createRBTree<OrderWithRequiredPrice, null>(
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

				let bidOrders = createRBTree<OrderWithRequiredPrice, null>(
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
						askOrders = askOrders.insert(order, null);
					} else {
						bidOrders = bidOrders.insert(order, null);
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

async function getLatestCandles() {
	latestCandles = new Map<{ assetId: Asset["id"]; resolution: Resolution }, Candle>();
	for (const asset of assets) {
		for (const resolution of Object.values(Resolution)) {
			const data = await prisma.historical_Data.findFirst({
				select: {
					timestamp: true,
					open: true,
					high: true,
					low: true,
					close: true,
					volume: true,
				},
				where: {
					assetId: asset.id,
					resolution,
				},
				orderBy: {
					timestamp: "desc",
				},
			});
			// creating a default candle, creating here and not outside, because of bugs it can cause (since heap alocated).
			const defaultCandle: Candle = {
				timestamp: new Date(0),
				open: 0,
				high: 0,
				low: Math.max(),
				close: 0,
				volume: 0,
			};
			latestCandles.set({ assetId: asset.id, resolution }, data || defaultCandle);
		}
	}
}

async function getMarkPrices() {
	try {
		markPrices = new Map(
			await Promise.all(
				assets.map(async (asset) => {
					const res = await axios.get(
						`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${asset.symbol}USDC`
					);
					return [asset.id, Number(res.data.markPrice)] as [Asset["id"], number];
				})
			)
		);
	} catch (e) {
		markPrices = new Map(
			assets.map((asset) => {
				return [
					asset.id,
					latestCandles.get({ assetId: asset.id, resolution: Resolution.ONE_MINUTE })!
						.close,
				] as [Asset["id"], number];
			})
		);
	}
}

// here non cash equity = IM of positions, due funding, pnl of positions
// export type UserWithPositionsAndOpenOrders = User & {
//   NonCashEquity: number;
//   maintenanceMargin: number;
//   orderMargin: number;
// } & (Position & { pnl: number })[] &
//   OrderWithRequiredPrice[];

async function getDetailedUsersState() {
	const usersWithPositions = await prisma.user.findMany({
		omit: {
			password: true,
		},
		include: {
			positions: true,
		},
	});

	detailedUsersState = new Map<User["id"], UserWithPositionsAndOpenOrders>();
	// make positions
	for (let user of usersWithPositions) {
		const detailedUserState: UserWithPositionsAndOpenOrders = {
			...user,
			maintenanceMargin: 0,
			InitialMargin: 0,
			orderMargin: 0,
			positions: new Map<Asset["id"], Position>(),
			orders: new Map<OrderWithRequiredPrice["id"], OrderWithRequiredPrice>(),
		};
		for (let position of user.positions) {
			detailedUserState.InitialMargin += calculateMarginWithoutFee(
				position.average_price,
				position.quantity,
				position.leverage
			); // initial margin
			detailedUserState.maintenanceMargin += calculateMaintenanceMargin(
				position.average_price,
				position.quantity
			);
			detailedUserState.positions.set(position.assetId, position);
		}
		detailedUsersState.set(user.id, detailedUserState);
	}

	const orders = await prisma.order.findMany({
		where: {
			status: Order_Status.OPEN,
		},
	});

	const addOrder = (order: OrderWithRequiredPrice) => {
		const extendedUser = detailedUsersState.get(order.userId)!;
		const remainingQuantity = order.quantity - order.filled_quantity;

		// since its order margin you should block fees also, bro you almost forgot it and could have included
		// potentially a hazardous bug in your system.
		// this bug would have been so dangerous that, you could never have figured it out.
		extendedUser.orderMargin += calculateMarginWithFee(
			remainingQuantity,
			order.price!,
			order.leverage,
			config.maker_fee
		);

		extendedUser.orders.set(order.id, order);
	};

	for (const [assetId, orderbook] of orderbooks) {
		for (const order of orderbook.askOrderbook.orders.keys) {
			addOrder(order);
		}
		for (const order of orderbook.bidOrderbook.orders.keys) {
			addOrder(order);
		}
	}
}

// include here
async function getInitialData() {
	await getAssets();
	await getOrderbooks();
	await getLatestCandles();
	await getMarkPrices();
	await getDetailedUsersState();
	await getSpotPrices();
	streamMarkPrices();
	streamSpotPrices();
	//   orderbooks = new Map<Asset["id"], OrderBook>(orderbookEntities);

	// getting user information

	// getting positions
}

await getInitialData();
