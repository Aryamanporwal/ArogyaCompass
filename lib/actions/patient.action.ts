"use server"
import { ID, Query } from "node-appwrite"
import { users } from "../appwrite.config"
type ErrorWithCode = {
    code: number;
    [key: string]: unknown;
};

export const createUser = async(user: CreateUserParams)=>{
    try{
        const newUser = await users.create(ID.unique(), user.email, user.phone, undefined , user.name)
        return newUser;
    }catch (error: unknown) {
    // Check existing user
    if (error && (error as ErrorWithCode)?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      return existingUser.users[0];
    }
    console.error("An error occurred while creating a new user:", error);
  }
}