"use client"
import Input from "@/components/Input";
import Switch from "@/components/Switch";
import SwitchOrder from "@/components/SwitchOrder";
import { Side } from "@/lib/frontend/orderbook";
import { use, useState } from "react";
import LeverageSlider from "@/components/LeverageSlider";
import { RecoilRoot } from "recoil";
import { signIn, signOut } from "next-auth/react";

const tempChoice = ["a", "b", "c"]

export default function Home() {
  
  const [leverage, setLeverage] = useState(1);

  return (
      <RecoilRoot>
        <button onClick={() => signIn()}>singin</button>
        <button onClick={() => signOut()}>signout</button>
      </RecoilRoot>
  );
}
