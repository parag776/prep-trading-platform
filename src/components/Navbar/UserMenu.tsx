"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import Button from "./Button";
import { useBalance } from "@/lib/frontend/hooks/accountHooks";

function UserMenu() {

	const balance = useBalance();
	const menuRef = useRef<null | HTMLDivElement>(null);
	function openMenu() {
		if (menuRef.current) {
			menuRef.current.style.display = "";
		}
	}
	useEffect(() => {
		const handler = (e: globalThis.MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				menuRef.current.style.display = "none";
			}
		};

		const doc = menuRef.current?.ownerDocument;
		doc?.addEventListener("mousedown", handler);

		return () => {
			doc?.removeEventListener("mousedown", handler);
		};
	}, []);

	const session = useSession();

	return (
		<div>
			<div onClick={openMenu} className="rounded-[50%] w-10 h-10 flex justify-center items-center cursor-pointer bg-[#2D1F23]">
				{session.data?.user?.image ? (
					<img src={session.data.user.image} className="rounded-[50%]" />
				) : (
					<p className="text-2xl font-sans text-[#E17879]">{session.data?.user?.name?.charAt(0)}</p>
				)}
			</div>
			<div className="relative ">
				<div ref={menuRef} style={{ display: "none" }} className={`absolute top-2 left-[-230px] w-[270px] shadow-sm shadow-black text-white bg-background-2`}>
					<div className="px-3 pt-5">
						<div className=" border-b-1 pb-3 border-gray-800">
							<div className="px-2">
								<p>{session.data?.user?.name}</p>
								<p className="text-slate-400">{session.data?.user?.email}</p>
							</div>
						</div>

						<div className=" border-b-1 pb-3 my-5 border-gray-800">
							<div className="px-2 ">
								<span>
									{" "}
									<img src="/icons/usdc.png" className="inline" /> USDC --&gt; {balance.status==="ready"?balance.data:0}
								</span>
							</div>
						</div>

						<div className=" border-b-1 pb-3 my-5 border-gray-800">
							<div className="px-2 cursor-pointer">
								<span onClick={() => signOut()} className="flex items-center">
									<img src={"/icons/signout.svg"} className="w-5" />
									<p className="ml-2">Sign Out</p>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default UserMenu;
