import { useInitializeAllAssets } from "../../lib/hooks/assetHooks";
import { useInitializeAccountMetrics } from "../../lib/hooks/accountHooks";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store/store";
import ChartDashboard from "../ChartDashboard/ChartDashboard";
import OrderPanel from "../OrderPanel/OrderPanel";
import TopBar from "../Topbar/TopBar";
import MarketDataPanel from "../MarketDataPanel/MarketDataPanel";
import AccountPanel from "../AccountPanel/AccountPanel";

function Home() {
	console.log("[times]", "home");

	const verifyUserAuthenticationRemote = useStore((state) => state.verifyUserAuthenticationRemote);
	const accountMetricsStatus = useInitializeAccountMetrics();
	const allAssetStatus = useInitializeAllAssets();
	const navigate = useNavigate();


	useEffect(() => {
		if (window.location.hash.includes("loginSuccess")) {
			toast.success("Login successful!");
			history.replaceState(null, "", window.location.pathname + window.location.search);
		}
		verifyUserAuthenticationRemote();
	}, []);

	if (allAssetStatus === "error" || accountMetricsStatus === "error") {
		navigate("/server-error");
	}

	return (
		<div className="flex w-dvw mb-10">
			<div className="w-full min-w-[900px] px-2">
				<div className="w-full h-20">
					<TopBar/>
				</div>
				<div className="h-160 flex pt-2">
					<ChartDashboard/>
					<div className="pl-2 min-w-75">
						<MarketDataPanel/>
					</div>
				</div>
				<div className="pt-2">
					<AccountPanel/>
				</div>
			</div>
			<div className="">
				<div className="w-[332px] h-150 pr-2">
					<OrderPanel/>
				</div>
			</div>
		</div>
	);
}

export default Home;
