"use client";

import { RecoilRoot } from "recoil";
import { SessionProvider } from "next-auth/react"

export function RecoilWrapper({ children }: { children: React.ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
export function SessionWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}