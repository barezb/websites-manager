import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import {compare} from "bcryptjs"
import { getUserByUsername } from "./lib/authActions";

// Notice this is only an object, not a full Auth.js instance
export default {
    providers: [Credentials({
        name: 'credentials',
        async authorize(creds){
        const { username, password } = creds;
            const user = await getUserByUsername(username as string);
            if (!user || !(await compare(password as string, user.password))) {
                return null;
            }
            return user;
        }
    })],
} satisfies NextAuthConfig