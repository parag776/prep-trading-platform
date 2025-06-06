import React from 'react'
import TopBar from './Topbar/TopBar'
import ChartDashboard from './ChartDashboard/ChartDashboard'
import MarketDataPanel from './MarketDataPanel/MarketDataPanel'
import AccountPanel from './AccountPanel/AccountPanel'
import OrderPanel from './OrderPanel/OrderPanel'

function TradingTerminal() {
  return (
    <div className='flex '>
        <div className='flex flex-col '>
            <TopBar/>
        <div className=''>
            <ChartDashboard/>
            <MarketDataPanel/>
        </div>
            <AccountPanel/>
        </div>

        <div className='w-26'>
            <OrderPanel/>
        </div>
    </div>
  )
}

export default TradingTerminal