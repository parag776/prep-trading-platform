"use client";
import React, { useEffect, useState } from "react";
import SwitchOrder from "./SwitchOrder";
import { Side } from "@/generated/prisma";
import Switch from "../Switch";
import Loading from "../Loading";

const choiceArray = ["Limit", "Market"];

function OrderPanel() {
	const [side, setSide] = useState<Side>(Side.BID);
	const [choice, setChoice] = useState<string>("Limit");
  const [equity, setEquity] = useState<number | null>(null);

  useEffect(()=>{

  }, [])

  if(!equity) return <div className="bg-background-2 w-full h-full flex flex-col rounded-xl">
    <Loading/>
  </div>


	return (
		<div className="bg-background-2 w-full h-full flex flex-col rounded-xl py-6 px-4 text-gray-400">
			<SwitchOrder side={side} setSide={setSide} />
			<div className="my-5">
				<Switch choiceArray={choiceArray} choice={choice} setChoice={setChoice} />
			</div>
			<div className="flex justify-between">
				<div className="text-[12px]">Available Equity</div>
			</div>
		</div>
	);
}

export default OrderPanel;
