import { Asset, Resolution, Side } from "@/generated/prisma";
export type ResolutionInfo = Map<
  Resolution,
  { symbol: string; duration: number }
>;

export interface OrderLite{
    side: Side,
    price: number,
    quantity: number
}

export interface CumulativeOrderLite extends OrderLite{
    cumulativeQuantity: number,
}

export interface HalfOrderBookLite{
    side: Side,
    orders: CumulativeOrderLite[]
}

export interface OrderBookLite{
    latestOrder: Date,
    askOrderbook: HalfOrderBookLite,
    bidOrderbook: HalfOrderBookLite
}
