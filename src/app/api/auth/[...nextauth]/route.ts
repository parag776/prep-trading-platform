import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/lib/backend/database";
import { v4 as uuid } from "uuid";
import Github from "next-auth/providers/github";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export const authOptions = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_ID!,
			clientSecret: process.env.GOOGLE_SECRET!,
		}),
		Github({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
		}),
	],
	callbacks: {
		async signIn({ user }: { user: any }) {
			const dbUser = await prisma.user.findFirst({
				where: {
					email: user.email!,
				},
			});

			if (!dbUser) {
				await prisma.user.create({
					data: {
						id: uuid(),
						name: user.name || "anonymous",
						email: user.email,
						img_url: user.image,
					},
				});
			}
			return true;
		},
		async session({ session }: { session: any; token: any }) {
			const user = await prisma.user.findFirst({
				select: {
					id: true,
					img_url: true,
				},
				where: {
					email: session.user.email,
				},
			});
			session.user.userId = user?.id;
			if(user?.img_url){
				session.user.image = user?.img_url
			}
			return session;
		},
	},
	jwt: {
		async encode(params: JWTEncodeParams) {
			return jwt.sign(
				{ email: params.token?.email, name: params.token?.name },
				params.secret,
				{
					expiresIn: params.maxAge,
				}
			);
		},
		async decode(params: JWTDecodeParams): Promise<JWT | null> {
			return jwt.verify(params.token!, params.secret) as JWT;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
