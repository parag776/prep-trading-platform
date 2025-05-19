import { Asset, Order, Order_Status, Order_Type, Position, Prisma, PrismaPromise, Side, User } from "@/generated/prisma";
import prisma from "./database";
import { matchingEngine } from "./matchingEngine";

interface SubscribeMessage{
    type: "subscribe",
    channel: "orderbook" | "tradebook" | "openOrders" | "positions",
    assetId: Asset["id"]
}

interface OrderMessage{
    type: "order",
    action: "place" | "cancel",
    payload: CancelOrder | placeOrder
}

interface CancelOrder{
    orderId: Order["id"];
}

interface placeOrder{
    type: Order_Type,
    side: Side,
    assetId: Asset["id"],
    price?: number,
    quantity: number,
    leverage: number,
}

interface OrderbookDiffResponse {
    assetId: Asset["id"],
    side: Side,
    price: number,
    quantity: number
}

interface OpenOrdersDiffResponse {
    userId: User["id"],
    assetId: Asset["id"],
    orderId: Order["id"],
    status: Order_Status,
    filled_quantitiy: number,
    average_filled_quantitiy: number,
}

interface PositionsDiffResponse{
    userId: User["id"],
    assetId: Asset["id"],
    positionId: Position["id"],
    side: Side,
    average_price: number,
    quantity: number,
}

interface tradeResponses{
    assetId: Asset["id"],
    price: number,
    quantity: number,
}

type WsMessage = SubscribeMessage | placeOrder;


// const openOrderSubsribers = new 
const orderbookSubscribers = new Set<WebSocket>();
const tradebookSubscribers = new Set<WebSocket>();
const openOrderSubscribers = new Map<User["id"], Set<WebSocket>>();
const positionSubscribers = new Map<User["id"], Set<WebSocket>>();

async function subscribe(message: SubscribeMessage, userId: User["id"] | null, client: WebSocket){

    switch (message.channel) {
        case "orderbook":
            orderbookSubscribers.add(client);
            break;
    
        case "tradebook":
            tradebookSubscribers.add(client);
            break;

        case "openOrders":

            const openOrderClients = openOrderSubscribers.get(userId!)  || (new Set<WebSocket>());
            openOrderSubscribers.set(userId!, openOrderClients)
            break;
        
        case "positions":

            const positionClients = positionSubscribers.get(userId!)  || (new Set<WebSocket>());
            positionSubscribers.set(userId!, positionClients)
            break;

        default:
            break;
    }
}

// unsubscribe is only valid for when connection is closed.
async function unSubscribe(userId: User["id"] | null, client: WebSocket){

    orderbookSubscribers.delete(client);
    tradebookSubscribers.delete(client);

    const openOrderClients = openOrderSubscribers.get(userId!)!
    openOrderClients.delete(client);
    if(openOrderClients.size===0){
        openOrderSubscribers.delete(userId!)
    }

    const positionClients = positionSubscribers.get(userId!)!
    positionClients.delete(client);
    if(positionClients.size===0){
        positionSubscribers.delete(userId!);
    }
}

// order responses and trade responses are being sent as an array. please remember this.
async function respondToSubscribers(){

    if(orderbookResponses.length){
        for(const client of orderbookSubscribers){
            client.send(JSON.stringify(orderbookResponses))
        }
    }

    if(tradeResponses.length){
        for(const client of tradebookSubscribers){
            client.send(JSON.stringify(tradeResponses))
        }
    }

    for(const [userId, responses] of positionResponses){
        if(!responses.length) continue;
        const subscribers = positionSubscribers.get(userId)
        
        if(subscribers){
            for(const client of subscribers){
                client.send(JSON.stringify(responses));
            }
        }
    }

    for(const [userId, responses] of openOrderResponses){
        if(!responses.length) continue;
        const subscribers = openOrderSubscribers.get(userId)
        
        if(subscribers){
            for(const client of subscribers){
                client.send(JSON.stringify(responses));
            }
        }
    }

    // empty all the responses.
    openOrderResponses = new Map<User["id"], Array<OpenOrdersDiffResponse>>();
    positionResponses = new Map<User["id"], Array<PositionsDiffResponse>>();
    orderbookResponses = new Array<OrderbookDiffResponse>()
    tradeResponses = new Array<tradeResponses>()

}

// why they are not in store and are here?, though they are stateful, but their state is only up until an order arives and fullfills, after that
// they are empty. also, they are not saved in case of crash. so basically they are not stored at all.

// order history will be calculated from openOrderResponses by the client.
let openOrderResponses = new Map<User["id"], Array<OpenOrdersDiffResponse>>();
let positionResponses = new Map<User["id"], Array<PositionsDiffResponse>>();
let orderbookResponses = new Array<OrderbookDiffResponse>()
let tradeResponses = new Array<tradeResponses>()

// this array will include all the functions that will run and 
let databaseActions: Array<() => PrismaPromise<any>>;

async function orderManager(order: Order, userId: User["id"]){

    // assign database actions an empty array
    databaseActions = [];

    // place order
    matchingEngine(order);

    // add to database. this step solidifies the order and changes the overall state of exchange.
    await prisma.$transaction(databaseActions.map(fn => fn()));

    // this step is to propogate to the clients who have subscribed.
    respondToSubscribers();

    // this step is to respond to the user who made the order.
    // this step is not necessary..


}