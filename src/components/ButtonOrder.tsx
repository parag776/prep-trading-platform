import { Side } from '@/lib/frontend/orderbook'
import React from 'react'

function Button({onClick, side}: {onClick: ()=>void, side:Side}) {

    return <button
    onClick={onClick}
    className={`active:opacity-80 cursor-pointer w-100 rounded-2xl py-3 text-center 
      ${side === Side.Bid ? 'bg-green-800 active:bg-green-900' : 'bg-red-800 active:bg-red-900'}`}>
    {side === Side.Bid ? 'Buy/Long' : 'Sell/Short'}
  </button>

}

export default Button