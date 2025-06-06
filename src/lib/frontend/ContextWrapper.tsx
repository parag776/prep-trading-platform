"use client";
import { SocketSubscribeProvider } from "./context/SocketSubscribeContext";
import { AssetProvider } from "./context/AssetContext";
import { SessionProvider } from "next-auth/react";

export function ContextWrapper({ children }: { children: React.ReactNode }) {
	return (
		<AssetProvider>
			<SessionProvider>{children}</SessionProvider>
		</AssetProvider>
	);
}
