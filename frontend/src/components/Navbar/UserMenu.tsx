import { useEffect, useRef } from "react";
import { useBalance } from "../../lib/hooks/accountHooks";
import { useStore } from "../../lib/store/store";

function UserMenu() {

	const balance = useBalance();
	const menuRef = useRef<null | HTMLDivElement>(null);
	const signOut = useStore((state)=>state.signOut);
	function openMenu() {
		if (menuRef.current) {
			menuRef.current.style.display = "";
		}
	}

	const signOutHandler = () => {
		signOut();
		window.location.reload();
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

	const userIdentity = useStore((state)=>state.userIdentity)!; // ! because we know it's not null

	return (
		<div>
			<div onClick={openMenu} className="rounded-[50%] w-10 h-10 flex justify-center items-center cursor-pointer bg-[#2D1F23]">
				{userIdentity.img_url? (
					<img src={userIdentity.img_url} className="rounded-[50%]" />
				) : (
					<p className="text-2xl font-sans text-[#E17879]">{userIdentity.name?.charAt(0)}</p>
				)}
			</div>
			<div className="relative ">
				<div ref={menuRef} style={{ display: "none" }} className={`absolute top-2 left-[-230px] w-[270px] shadow-sm shadow-black text-white bg-background-2`}>
					<div className="px-3 pt-5">
						<div className=" border-b-1 pb-3 border-gray-800">
							<div className="px-2">
								<p>{userIdentity.name}</p>
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
								<span onClick={signOutHandler} className="flex items-center">
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
