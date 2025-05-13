import { Asset, Resolution, Trade } from "@/generated/prisma";
import { latestCandles } from "./store";
import { resolutionInfo } from "../common/data";
import config from "../../../config.json"

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

export function calculateMaintenanceMargin(price: number, quantity: number){
    return price*quantity*config.maintainence_margin
}

// seeing if the candle is past their life, if not adjust it and if it is then create a new candle.
export function adjustCandle(assetId: Asset["id"], resolution: Resolution, trade: Trade){
    const currentCandle = latestCandles.get({assetId, resolution})!;
    const duration = resolutionInfo.get(resolution)!.duration;
    const tradetime = trade.createdAt.getTime();

    const candleStartTimestamp = Math.floor(tradetime/duration)*duration;

    if(currentCandle.timestamp.getTime()<candleStartTimestamp){
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
        currentCandle.volume+=trade.quantity;
    }
}

export function getContractPrice(assetId: Asset["id"]){
    return latestCandles.get({assetId, resolution: Resolution.ONE_MINUTE})!.close;
}