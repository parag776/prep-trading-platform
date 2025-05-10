"use client"
import Button from "@/components/ButtonOrder";
import Input from "@/components/Input";
import Switch from "@/components/Switch";
import SwitchOrder from "@/components/SwitchOrder";
import { Side } from "@/lib/orderbook";
import { use, useState } from "react";
import LeverageSlider from "@/components/LeverageSlider";
import { RecoilRoot } from "recoil";

const tempChoice = ["a", "b", "c"]

export default function Home() {
  
  const [leverage, setLeverage] = useState(1);

  return (
      <RecoilRoot>
        <LeverageSlider leverage={leverage} setLeverage={setLeverage}/>
      </RecoilRoot>
  );
}
