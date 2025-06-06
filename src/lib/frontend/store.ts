
import { atom, atomFamily, selector, selectorFamily } from "recoil";
import axios from "axios";
import type { OrderBookLite } from "../common/types";

// 1. Selected symbol (e.g., "SOL", "BTC")
export const symbolState = atom<string>({
  key: "symbolState",
  default: "SOL",
});

// 2. AtomFamily to store orderbook per symbol (writable)
export const orderbookState = atom<OrderBookLite>({
  key: "orderbookState",
  default: selector({
    key: "orderbookState/Default",
    get: async ({get}) => {
        const symbol = get(symbolState);
        const { data } = await axios.get(`/api/orderbook?symbol=${symbol}`);
        return data as OrderBookLite;
    }
  }),
});

export const orderbookSelector = selector<OrderBookLite>({
  key: "currentOrderbookSelector",
  get: ({ get }) => {
    return get(orderbookState);
  },
  set: ({ set }, newOrderbook) => {
    set(orderbookState, newOrderbook);
  },
});