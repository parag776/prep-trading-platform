import { Asset, Historical_Data } from "../../src/generated/prisma/client.js";
import { resolutionInfo } from "../../../shared/data.mjs";
import axios from "axios";


export async function fetchHttpSpotPrice(asset: Asset): Promise<number> {
  const symbol = `${asset.symbol}USDC`; // e.g., BTCUSDC
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

  const response = await axios.get(url);
  return Number(response.data.price);
  
}

export function getAllResolutionData(data: Array<Historical_Data>){

  const allResolutionData = new Array<Historical_Data>();
  const millisecondsInAMinute = 60*1000;

  for(const resolution of resolutionInfo){
    let curCandle: Historical_Data = structuredClone(data[0])
    curCandle.resolution = resolution[0];
    let endTime = curCandle.timestamp.getTime();

    for(let i=1;i<data.length;i++){
      if((data[i].timestamp.getTime()+millisecondsInAMinute)%resolution[1].duration === 0){ // start of new candle time curtime%duration = -1
        endTime = data[i].timestamp.getTime();
        curCandle.timestamp = structuredClone(data[i-1].timestamp);
        allResolutionData.push(curCandle);
        curCandle = structuredClone(data[i]);
        curCandle.resolution = resolution[0];
      }
      
      curCandle.low = Math.min(data[i].low, curCandle.low);
      curCandle.high = Math.max(data[i].high, curCandle.high);
      curCandle.open = data[i].open;
      curCandle.volume += data[i].volume;
      // close is already taken into account.
    }

    const candleStart = Math.floor(data[data.length-1].timestamp.getTime()/resolution[1].duration)*resolution[1].duration;
    curCandle.timestamp = new Date(candleStart);
    allResolutionData.push(curCandle)
    
  }

  return allResolutionData;

}