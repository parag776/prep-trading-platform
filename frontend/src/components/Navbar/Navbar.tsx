import Button from "./Button";
import TransactionButton from "./TransactionButton";
import type { ReactNode } from "react";
import { useDeposit, useWithdraw } from "../../lib/hooks/accountHooks";
import { useStore } from "../../lib/store/store";
import UserMenu from "./UserMenu";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Navbar({ img }: { img: string }) {
	const location = useLocation();

	const authStatus = useStore((state) => state.authenticationStatus);
	const deposit = useDeposit();
	const withdraw = useWithdraw();
	const navigate = useNavigate();

	const unAuthenticatedJSX =
		location.pathname === "/auth" ? (
			<div className="cursor-pointer">
				<Button onClick={() => navigate("/")} color="blue" text={"Home"} />
			</div>
		) : (
			<div className="cursor-pointer">
				<Button onClick={() => navigate("/auth")} color="green" text={"Sign In"} />
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
				<UserMenu />
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
			{renderSessionUI(authStatus)}
		</div>
	);
}

export default Navbar;
