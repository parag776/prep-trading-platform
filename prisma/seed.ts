
import { PrismaClient } from "../src/generated/prisma"

const prisma = new PrismaClient();

const assets = [
    {
        symbol: "SOL",
        name: "solana",
    },
    {
        symbol: "BNB",
        name: "binance coin",
    },
    {
        symbol: "BTC",
        name: "bitcoin",
    },
    {
        symbol: "ETH",
        name: "ethereum",
    },
    {
        symbol: "USDC",
        name: "usd coin",
    },
    {
        symbol: "XPR",
        name: "xrp",
    }
]

prisma.asset.createMany({
    data: assets
}).then(async (data)=>{
    console.log(data);
    await prisma.$disconnect();
})

//seed should include historical data, or it should include