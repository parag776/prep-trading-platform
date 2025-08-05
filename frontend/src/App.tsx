import { Outlet, Route, Routes } from "react-router-dom";
import Auth from "./components/AuthPage/Auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
import NotFound from "./components/ErrorPages/NotFound";
import ServerError from "./components/ErrorPages/ServerError";

function App() {
	console.log("[times]", "App");
	

	return (
		<Routes>
			{/* ✅ All routes that need Navbar */}
			<Route
				element={
					<>
						<Navbar img={"/icons/coinbook.png"} />
						<div className="flex mt-2">
							<Outlet /> {/* children render here */}
						</div>
						<ToastContainer
							position="bottom-right"
							autoClose={3000}
							newestOnTop={false}
							closeOnClick
							pauseOnHover
							theme="dark"
							pauseOnFocusLoss={false}
						/>
					</>
				}
			>
				<Route path="/" element={<Home />} />
				<Route path="/auth" element={<Auth />} />
			</Route>

			<Route path="*" element={<NotFound />} />
			<Route path="/server-error" element={<ServerError />} />
		</Routes>
	);
}

export default App;
