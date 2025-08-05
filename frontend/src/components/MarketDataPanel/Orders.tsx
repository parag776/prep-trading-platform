"use client"
import type { Side } from "../../../../backend/src/generated/prisma"
import type { CumulativeOrderLite } from "../../../../shared/types.mjs"
import { useMemo} from 'react'
import Level from './Level';
import { getArrayWithKeys } from "../../lib/utils/misc";


// type CumulativeOrderLiteWithKeys = CumulativeOrderLite & {_key: string}

function Orders({orders, side, isSizeInUsdc, decimalPoints}: {orders: CumulativeOrderLite[], side: Side, isSizeInUsdc: boolean, decimalPoints: {price: number, quantity: number}}) {

  const direction = {
    ASK: "column-reverse",
    BID: "column"
  } as const

  const flexDirection: "row" | "row-reverse" | "column" | "column-reverse" = direction[side];

  const totalQuantity = orders.at(-1)?.cumulativeQuantity ?? 0


  let orderWithKeys = useMemo(()=>{
    return getArrayWithKeys(orders)
  }, [orders])


  return (
    <div style={{display: "flex", flexDirection}}>
      {orderWithKeys.map((order)=>{
        return <Level key={order._key} price={order.price} quantiy={order.quantity} cumulativeQuantity={order.cumulativeQuantity} totalQuantity={totalQuantity} side={side} isSizeInUsdc={isSizeInUsdc} decimalPoints={decimalPoints}/>
      })}
    </div>
  )
}

export default Orders