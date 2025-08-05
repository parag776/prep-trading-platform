import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // your global styles
import { BrowserRouter } from "react-router-dom";
import "./lib/axiosSetup" // intercepting axios for changing strings to dates

ReactDOM.createRoot(document.getElementById("root")!).render(
		<BrowserRouter>
			<ToastContainer />
			<App />
		</BrowserRouter>
);
