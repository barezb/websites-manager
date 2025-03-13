'use server'

import bcrypt from "bcryptjs";
import { prisma } from "./pirsma";
import { LoginSchema, RegisterSchema } from "./types";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function signInUser(data: LoginSchema):Promise<ActionResult<string>> {
    try {
        const result = await signIn("credentials", {

            username: data.username,
            password: data.password,
            redirect: false,
        })
        console.log(result);
        return {status:'success', data: 'Logged in'}
    } catch (error) {
        console.log(error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { status: 'error', error: 'Invalid credentials' }
                default:
                    return { status: 'error', error: 'Unknown error while executing Authactions signin' }
                }
        } else {
            return { status: 'error', error: 'Something wrong happened while executing Authactions signin' }

        }
    }

}
export async function registerUser(data: RegisterSchema) {
    const { name, username, email, password } = data;
    const pwHash = await bcrypt.hash(password as string, 10);

    // check existing user
    const existingUser = await prisma.user.findUnique({
        where: {
            username: username as string
        }
    })
    if (!existingUser) {
        // create user
        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: pwHash
            }
        })
        console.log("user created successfully: " + newUser)
        return newUser;
    } else {
        
    }
    throw new Error("User already exists")
}
export async function getUserByUsername(username: string) {
    return prisma.user.findUnique({
        where: {
            username
        }
    })
}
export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    })
    return user;
}