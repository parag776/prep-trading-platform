import { useRef, useState } from "react";
import "./Auth.css"; // put your CSS in Auth.css
import { FaGithub, FaGooglePlusG } from "react-icons/fa";
import { toast } from "react-toastify";
import { registrationValidation, loginValidation } from "./userValidation";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store/store";

const Auth = () => {
	const [isRightPanelActive, setIsRightPanelActive] = useState(false);
	const navigate = useNavigate();

	const localSignIn = useStore((state) => state.localSignIn);
	const localRegister = useStore((state) => state.localRegister);

	// Create refs for sign-in and sign-up form fields
	const signInUsernameRef = useRef<HTMLInputElement>(null);
	const signInPasswordRef = useRef<HTMLInputElement>(null);

	const signUpNameRef = useRef<HTMLInputElement>(null);
	const signUpUsernameRef = useRef<HTMLInputElement>(null);
	const signUpPasswordRef = useRef<HTMLInputElement>(null);

	const handleLocalSignIn = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const username = signInUsernameRef.current?.value || "";
		const password = signInPasswordRef.current?.value || "";

		const result = loginValidation.safeParse({
			username,
			password,
		});

		if (!result.success) {
			const firstError = result.error.issues[0].message || "Invalid input";
			toast.error(firstError);
			return;
		}
		localSignIn(username, password)
			.then(() => {
				toast.success("Login successful!");
				navigate("/");
			})
			.catch((error) => {
				let errorMsg = "Login failed. Please check your credentials.";
				if (!error.response || !(error.response.status === 401)) {
					errorMsg = "Server error, please try again.";
				}

				toast.error(`${errorMsg}`);
			});
	};

	const handleLocalSignUp = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const name = signUpNameRef.current?.value || "";
		const username = signUpUsernameRef.current?.value || "";
		const password = signUpPasswordRef.current?.value || "";

		const result = registrationValidation.safeParse({
			name,
			username,
			password,
		});

		if (!result.success) {
			const firstError = result.error.issues[0].message || "Invalid input";
			toast.error(firstError);
			return;
		}

		localRegister(name, username, password)
			.then(() => {
				toast.success("Registration successful!");
				navigate("/");
			})
			.catch((error) => {
				let errorMsg = "Username already exists. Please try again.";
				if (!error.response || !(error.response.status === 409)) {
					console.log("reached here");
					errorMsg = "Server error, please try again.";
				}
				toast.error(`${errorMsg}`);
			});
	};

	return (
		<div className="w-dvw h-dvh flex justify-center items-center">
			<div className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""} `} id="container">
				{/* Sign Up */}
				<div className="auth-form-container sign-up-container">
					<form onSubmit={handleLocalSignUp} className="auth-form">
						<div className="flex items-end">
							<h1 className="font-bold">Create Account</h1>
							<img className="w-8 h-8 ml-2" src={"/icons/coinbook.png"} alt="CoinBook" />
						</div>
						<div className="social-container">
							<a href={`/api/auth/google`} className="social">
								<FaGooglePlusG className="text-2xl" />
							</a>
							<a href={`/api/auth/github`} className="social">
								<FaGithub className="text-2xl" />
							</a>
						</div>
						<input type="text" placeholder="Name" ref={signUpNameRef} className="auth-input" />
						<input type="username" placeholder="Username" ref={signUpUsernameRef} className="auth-input" />
						<input type="password" placeholder="Password" ref={signUpPasswordRef} className="auth-input" />
						<button className="auth-button">Sign Up</button>
						<div className="md:hidden mt-4 text-sm">
							Already have an account?{" "}
							<div
								style={{
									color: "#2563eb",
									fontWeight: "bold",
									textDecoration: "underline",
									cursor: "pointer",
									display: "inline-block",
								}}
								onClick={() => setIsRightPanelActive(false)}
							>
								Sign In
							</div>
						</div>
					</form>
				</div>

				<div className="auth-form-container sign-in-container mt-3">
					<form onSubmit={handleLocalSignIn} className="auth-form">
						<div className="flex items-end">
							<h1 className="font-bold">Sign in</h1>
							<img className="w-8 h-8 ml-2" src={"/icons/coinbook.png"} alt="CoinBook" />
						</div>
						<div className="social-container">
							<a href={`/api/auth/google`} className="social">
								<FaGooglePlusG className="text-2xl" />
							</a>
							<a href={`/api/auth/github`} className="social">
								<FaGithub className="text-2xl" />
							</a>
						</div>
						<input type="username" placeholder="Username" ref={signInUsernameRef} className="auth-input" />
						<input type="password" placeholder="Password" ref={signInPasswordRef} className="auth-input" />
						<button className="auth-button">Sign In</button>
						<div className="mt-4 text-sm">
							<div className="md:hidden">
								Not registered?{" "}
								<div
									style={{
										color: "#2563eb",
										fontWeight: "bold",
										textDecoration: "underline",
										cursor: "pointer",
										display: "inline-block",
									}}
									onClick={() => setIsRightPanelActive(true)}
								>
									Create an account
								</div>
							</div>
						</div>
					</form>
				</div>

				{/* Overlay */}
				<div className="auth-overlay-container">
					<div className="auth-overlay">
						<div className="auth-overlay-panel auth-overlay-left">
							<div className="flex items-end">
								<h1 className="font-bold">Welcome Back!</h1>
								<img className="w-8 h-8 ml-2" src={"/icons/coinbook.png"} alt="CoinBook" />
							</div>
							<p>To keep connected with us please login with your personal info</p>
							<button className="auth-button" onClick={() => setIsRightPanelActive(false)}>
								Sign In
							</button>
						</div>
						<div className="auth-overlay-panel auth-overlay-right">
							<div className="flex items-end">
								<h1 className="font-bold">Hello, Wecome To CoinBook!</h1>
								<img className="w-8 h-8 ml-2" src={"/icons/coinbook.png"} alt="CoinBook" />
							</div>
							<p>If you don't have an account, please sign up</p>
							<button className="auth-button" onClick={() => setIsRightPanelActive(true)}>
								Sign Up
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Auth;
