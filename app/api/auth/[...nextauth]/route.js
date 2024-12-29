import NextAuthModule from "next-auth";
const NextAuth = NextAuthModule.default;

import CredentialsProviderModule from "next-auth/providers/credentials";
const CredentialsProvider = CredentialsProviderModule.default;

import User from "../../../../database/models/user";
import dbConnect from "../../../../database/dbConnect";

const handler = NextAuth({
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				await dbConnect();

				const { email, password } = credentials;

				const user = await User.findOne({ email }).select("+password");

				if (!user) {
					throw new Error("Email does not exist");
				}

				const isPasswordMatched = await user.comparePassword(password);

				if (!isPasswordMatched) {
					throw new Error("Invalid email or password");
				}

				const { password: pwd, ...userWithoutPassword } = user.toObject();
				return userWithoutPassword;
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.user = user;
			}
			return token;
		},
		session: async ({ session, token }) => {
			session.user = token.user;
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
