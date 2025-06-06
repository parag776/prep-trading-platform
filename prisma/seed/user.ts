import { PrismaPromise } from "@/generated/prisma"
import {v4 as uuid} from "uuid"

import prisma from "./prismaClient";


// please seed with atleast 1 user..
export const users = [
    {
        id: uuid(),
        email: "paragg1998@gmail.com",
        name: "Parag g Goyal",
        usdc: 100000,
    },
    {
        id: uuid(),
        email: "adkusum17@gmail.com",
        name: "Kusum Gupta",
        usdc: 100000,
    },
    {
        id: uuid(),
        email: "p16118171@gmail.com",
        name: "parag gupta",
        usdc: 100000,
    },
    {
        id: uuid(),
        email: "parag.p.gupta@gmail.com",
        name: "Parag Gupta",
        usdc: 100000,
    },
]

export default function fillUsers(seedingQueries: Array<()=>PrismaPromise<any>>){
    seedingQueries.push(()=>prisma.user.createMany({
        data: users
    }));
}