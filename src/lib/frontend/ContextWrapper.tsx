"use client";
import { SessionProvider } from "next-auth/react";

export function ContextWrapper({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			{children}
		</SessionProvider>
	);
}
