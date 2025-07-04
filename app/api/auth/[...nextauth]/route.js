import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                name: { label: "Name", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.name) return null;

                return {
                    id: credentials.email,
                    name: credentials.name,
                    email: credentials.email,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };