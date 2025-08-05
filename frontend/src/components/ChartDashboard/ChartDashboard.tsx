import React from 'react'
import { useAsset } from '../../lib/hooks/assetHooks';
import Loading from '../Loading';
import Chart from './Chart';

function ChartDashboard() {

  
	const currentAsset = useAsset();
  if(currentAsset.status==="loading") return <Loading/>

  return (
    <div className='h-full w-full bg-background-2 rounded-xl'>
      <Chart symbol={currentAsset.data.symbol}/>
    </div>
  )
}

export default ChartDashboard