"use client";
import { signIn, useSession } from "next-auth/react";
import Button from "./Button";
import TransactionButton from "./TransactionButton";
import { ReactNode} from "react";
import UserMenu from "./UserMenu";
import { useDeposit, useWithdraw } from "@/lib/frontend/hooks/accountHooks";

function Navbar({ img }: { img: string }) {
	const session = useSession();
	const deposit = useDeposit();
	const withdraw = useWithdraw();

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
                <UserMenu/>
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
