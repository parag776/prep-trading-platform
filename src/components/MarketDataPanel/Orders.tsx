"use client"
import { Side } from '@/generated/prisma'
import { CumulativeOrderLite } from '@/lib/common/types'
import React, { useMemo, useRef } from 'react'
import Level from './Level';
import { getArrayWithKeys } from '@/lib/frontend/utils/misc';


type CumulativeOrderLiteWithKeys = CumulativeOrderLite & {_key: string}

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