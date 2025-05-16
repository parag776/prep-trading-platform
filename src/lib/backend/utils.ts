import { Asset, Resolution, Side, Trade } from "@/generated/prisma";
import { latestCandles, orderbooks } from "./store";
import { resolutionInfo } from "../common/data";
import config from "../../../config.json";
import { CumulativeOrderLite, OrderBookLite } from "../common/types";
import createRBTree from "functional-red-black-tree";
import { OrderWithRequiredPrice } from "./types";

export function calculateMarginWithoutFee(
  price: number,
  quantity: number,
  leverage: number
) {
  return (price * quantity) / leverage;
}

export function calculateFee(
  price: number,
  quantity: number,
  leverage: number,
  feeRate: number
) {
  return ((price * quantity) / leverage) * feeRate;
}

export function calculateMarginWithFee(
  price: number,
  quantity: number,
  leverage: number,
  fee: number
) {
  return ((price * quantity) / leverage) * (1 + fee);
}

export function calculateMaintenanceMargin(price: number, quantity: number) {
  return price * quantity * config.maintainence_margin;
}

// seeing if the candle is past their life, if not adjust it and if it is then create a new candle.
export function adjustCandle(
  assetId: Asset["id"],
  resolution: Resolution,
  trade: Trade
) {
  const currentCandle = latestCandles.get({ assetId, resolution })!;
  const duration = resolutionInfo.get(resolution)!.duration;
  const tradetime = getTime(trade.createdAt);

  const candleStartTimestamp = Math.floor(tradetime / duration) * duration;

  if (getTime(currentCandle.timestamp) < candleStartTimestamp) {
    currentCandle.timestamp = new Date(candleStartTimestamp);
    currentCandle.open = trade.price;
    currentCandle.high = trade.price;
    currentCandle.low = trade.price;
    currentCandle.close = trade.price;
    currentCandle.volume = trade.quantity;
  } else {
    currentCandle.close = trade.price;
    currentCandle.high = Math.max(currentCandle.high, trade.price);
    currentCandle.low = Math.min(currentCandle.low, trade.price);
    currentCandle.volume += trade.quantity;
  }
}

export function getContractPrice(assetId: Asset["id"]) {
  return latestCandles.get({ assetId, resolution: Resolution.ONE_MINUTE })!
    .close;
}

export function getTime(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function getOrdersLiteArray(
  orders: createRBTree.Tree<OrderWithRequiredPrice, null>
) {
  const ordersArray = orders.keys;

  const ordersLite = new Array<CumulativeOrderLite>();

  if (ordersArray.length === 0) return ordersLite;

  const side = ordersArray[0].side;
  let price = ordersArray[0].price;
  let quantity = ordersArray[0].quantity;
  let cumulativeQuantity = ordersArray[0].quantity;

  for (let i = 1; i < ordersArray.length; i++) {
    if (price === ordersArray[i].price) {
      quantity += ordersArray[i].price;
    } else {
      ordersLite.push({ price, quantity, cumulativeQuantity, side });
      price = ordersArray[i].price;
      quantity = ordersArray[i].quantity;
    }
    cumulativeQuantity += ordersArray[i].quantity;
  }
  ordersLite.push({ price, quantity, cumulativeQuantity, side });

  return ordersLite;
}

export function getOrderbookLite(assetId: Asset["id"]) {
  const orderbook = orderbooks.get(assetId)!;

  const askOrders = orderbook.askOrderbook.orders;
  const bidOrders = orderbook.bidOrderbook.orders;

  const orderbookLite: OrderBookLite = {
    latestOrder: new Date(orderbook.lastOrderTimestamp.getTime()),
    askOrderbook: {
      side: Side.ASK,
      orders: getOrdersLiteArray(askOrders),
    },
    bidOrderbook: {
      side: Side.BID,
      orders: getOrdersLiteArray(bidOrders),
    },
  };

  return orderbookLite;
}
