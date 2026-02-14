import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function loginUser(credentials: any) {
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to login");
        }

        if (data.user) {
            return {
                ...data.user,
                apiToken: data.token, // Store JWT token from backend
            };
        }
        return null;
    } catch (error) {
        console.error("Login error:", error);
        return null;
    }
}

const config = {
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const user = await loginUser(parsedCredentials.data);
                    if (!user) return null;
                    return user;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.apiToken = user.apiToken;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.apiToken = token.apiToken;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
