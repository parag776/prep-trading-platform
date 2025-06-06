"use client";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "./Button";
import TransactionButton from "./TransactionButton";
import { ReactNode, useEffect, useState } from "react";
import UserMenu from "./UserMenu";

function Navbar({ img }: { img: string }) {
	const session = useSession();
    
    const [userBalance, setUserBalance] = useState(0);

    async function fetchUserBalance(){
        const {data} = await axios.get("/api/balance");
        const balance = data.usdc
        setUserBalance(balance);
    }

    useEffect(()=>{
        if(session.status==="authenticated"){
            fetchUserBalance();
        }
    }, [session.status])

	async function deposit(amount: number) {
		await axios.post("/api/deposit", {
			amount,
		});
        await fetchUserBalance();
	}

	async function withdraw(amount: number) {
		await axios.post("/api/deposit", {
			amount: -amount,
		});
        await fetchUserBalance();
	}

	const unAuthenticatedJSX = (
		<div className="cursor-pointer">
			<Button onClick={() => signIn()} color="green" text={"Sign In"} />
		</div>
	);

	const authenticatedJSX = (
		<div className="flex items-center">
            <div>
			    <TransactionButton type={"deposit"} callback={deposit} />
            </div>
            <div className="px-3">
			    <TransactionButton type={"withdraw"} callback={withdraw} />
            </div>
            <div className="z-100">
                <UserMenu userBalance={userBalance}/>
            </div>
		</div>
	);

    function renderSessionUI(status: "loading" | "authenticated" | "unauthenticated"): ReactNode {
        switch (status) {
            case "authenticated":
            return authenticatedJSX;
            case "unauthenticated":
            return unAuthenticatedJSX;
            default:
            return null;
        }
    }

	return (
		<div className="flex justify-between h-12 items-end px-5">
			<div className="flex items-center">
				<img src={img} className="w-7" />
				<p className="text-white ml-2 text-xl">CoinBook</p>
			</div>
			{renderSessionUI(session.status)}
		</div>
	);
}

export default Navbar;
