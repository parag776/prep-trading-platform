
import { create } from "zustand";
import { createTradebookSlice } from "./TradebookSlice";
import { createPositionsSlice } from "./positionsSlice";
import { createOrderSlice } from "./orderSlice";
import { createOrderbookSlice } from "./orderbookSlice";
import { createMarkPriceSlice } from "./markPriceSlice";
import { createAssetSlice } from "./assetSlice";
import { createAccountMetricsSlice } from "./accountSlice";
import { Store } from "./types";

export const useStore = create<Store>((...a) => ({
  ...createTradebookSlice(...a),
  ...createPositionsSlice(...a),
  ...createOrderSlice(...a),
  ...createOrderbookSlice(...a),
  ...createMarkPriceSlice(...a),
  ...createAssetSlice(...a),
  ...createAccountMetricsSlice(...a),
}));