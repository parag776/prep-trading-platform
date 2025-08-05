import { useState } from "react";
import Switch from "../Switch";
import { useStore } from "../../lib/store/store";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";
import AccountInitializer from "./AccountInitializer";
import "./AccountPanel.css"

const choiceArray = ["Positions", "Open Orders", "Filled History"];

function AccountPanel() {
	// console.log("account")
	const [section, setSection] = useState("Positions");
	const navigate = useNavigate();

	const authStatus = useStore((state) => state.authenticationStatus);
	if (authStatus === "loading") return <Loading />;

	function getPanel() {
		if (authStatus === "unauthenticated") {
			return (
				<div className="w-full min-h-50 flex justify-center items-center">
					<p>
						Please{" "}
						<span className="text-blue-500 cursor-pointer" onClick={() => navigate("/auth")}>
							sign in
						</span>{" "}
						first
					</p>
				</div>
			);
		}
		return <AccountInitializer section={section}/>
	}

	return (
		<div className="bg-background-2 w-full min-h-50 rounded-xl pt-6 px-4 text-gray-400">
			<Switch choiceArray={choiceArray} choice={section} setChoice={setSection} />
			<div className="w-full mt-3 h-full">{getPanel()}</div>
		</div>
	);
}

export default AccountPanel;
