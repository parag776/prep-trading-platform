import NextAuth, { Session } from "next-auth"
import Google from "next-auth/providers/google"
import prisma from "@/lib/backend/database";
import {v4 as uuid} from "uuid";
import Github from "next-auth/providers/github";
import { User } from "@/generated/prisma";

export const authOptions =  {
    providers: [
        Google({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        Github({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        })
    ],
    callbacks: {
        async signIn({user}: {user: any}){
            
            const dbUser = await prisma.user.findFirst({
                where: {
                    email: user.email!
                }
            })

            if(!dbUser){
                await prisma.user.create({
                    data: {
                        id: uuid(),
                        name: user.name || "anonymous",
                        email: user.email!,
                    }
                })
            }
            return true;
        },
        async session({session}: {session: any, token: any}){
            const user = await prisma.user.findFirst({
                select: {
                    id: true,
                },
                where: {
                    email: session.user.email
                }
            })
            session.userId = user?.id;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }