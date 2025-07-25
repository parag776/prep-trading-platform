import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ContextWrapper } from "@/lib/frontend/ContextWrapper";
import { ToastContainer } from 'react-toastify';
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CoinBook",
	description: "Crypto perpetual futures trading platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ContextWrapper>{children}</ContextWrapper>
				<ToastContainer/>
			</body>
		</html>
	);
}
