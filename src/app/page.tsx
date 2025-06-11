"use client";
import MarketDataPanel from "@/components/MarketDataPanel/MarketDataPanel";
// import { Side } from "@/lib/frontend/orderbook";
import Navbar from "@/components/Navbar/Navbar";
import OrderPanel from "@/components/OrderPanel/OrderPanel";

const tempChoice = ["a", "b", "c"];

export default function Home() {
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
