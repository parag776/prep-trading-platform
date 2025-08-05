import PositionPanel from "./PositionPanel";
import { useInitializePositions } from "../../lib/hooks/positionHooks";
import { useInitializeOrders } from "../../lib/hooks/orderHooks";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";
import OpenOrderPanel from "./OpenOrderPanel";
import FilledHistoryPanel from "./FilledHistoryPanel";

function AccountInitializer({ section }: { section: string }) {
	// console.log("very inside")
	const initializePositionsStatus = useInitializePositions();
	const initializeOrdersStatus = useInitializeOrders();
	const navigate = useNavigate();

	if (initializeOrdersStatus === "error" || initializePositionsStatus === "error") navigate("/server-error");
	if (initializeOrdersStatus === "loading" || initializePositionsStatus === "loading") return <Loading />;

	switch (section) {
		case "Positions":
			return <PositionPanel />;
		case "Open Orders":
			return <OpenOrderPanel />;
		case "Filled History":
			return <FilledHistoryPanel />;
		default:
			return <></>;
	}
}

export default AccountInitializer;
