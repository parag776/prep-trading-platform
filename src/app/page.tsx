"use client";
// import { Side } from "@/lib/frontend/orderbook";
import Navbar from "@/components/Navbar/Navbar";
import OrderPanel from "@/components/OrderPanel/OrderPanel";
import { useInitializeAccountMetrics } from "@/lib/frontend/hooks/accountHooks";
import { useFetchAllAssets } from "@/lib/frontend/hooks/assetHooks";
import { useInitializePositions } from "@/lib/frontend/hooks/positionHooks";

export default function Home() {

  useFetchAllAssets()
  useInitializeAccountMetrics()
  useInitializePositions()

	return (
		<div className="bg-background-1 h-screen font-mono text-slate-200 w-screen">
			<Navbar img={"/icons/btc.png"} />
      <div className="flex justify-center items-center">
        <div className="w-80 h-150">
          <OrderPanel />
        </div>
      </div>
		</div>
	);
}
