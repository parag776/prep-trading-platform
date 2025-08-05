import { PrismaPromise } from "../../src/generated/prisma/client.js"
import {v4 as uuid} from "uuid"
import bcrypt from "bcrypt"
import prisma from "./prismaClient.js";
import configData from "../../../shared/config.mjs"

// please seed with atleast 1 user..
export const users = [
    // {
    //     id: uuid(),
    //     name: "Parag g Goyal",
    //     usdc: 100000,
    //     username: "parag776",
    //     password: bcrypt.hashSync("Y&]^+J(uay4&OrD", 10),
    // },
    // {
    //     id: uuid(),
    //     name: "Kusum Gupta",
    //     usdc: 100000,
    //     username: "kusum776",
    //     password: bcrypt.hashSync("Y&]^+J(uay4&OrD", 10),
    // },
    // {
    //     id: uuid(),
    //     name: "parag gupta",
    //     usdc: 100000,
    //     username: "parag7767",
    //     password: bcrypt.hashSync("Y&]^+J(uay4&OrD", 10),
    // },
    // {
    //     id: uuid(),
    //     name: "Parag Gupta",
    //     usdc: 100000,
    //     username: "parag7769",
    //     password: bcrypt.hashSync("Y&]^+J(uay4&OrD", 10),
    // },
    {
        id: configData.market_maker_id,
        name: "market maker",
        usdc: Number.MAX_SAFE_INTEGER,
        username: "market_maker",
    }
]

export default function fillUsers(seedingQueries: Array<()=>PrismaPromise<any>>){
    seedingQueries.push(()=>prisma.user.createMany({
        data: users
    }));
}