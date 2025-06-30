"use server"
import { ID, Query } from "node-appwrite"
import { users } from "../appwrite.config"
import { Resend } from "resend"; 
type ErrorWithCode = {
    code: number;
    [key: string]: unknown;
};

export const createUser = async (user: CreateUserParams) => {
  const resend = new Resend('re_PFSSmak7_FrQaPKiRyRjLH8n3fQ84eBjd');
  try {
    const newUser = await users.create(
      ID.unique(), 
      user.email, 
      user.phone, 
      undefined, 
      user.name
    );
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Your Email Verification Code",
      html: `<p>Hello ${user.name},</p>
             <p>Your verification code is:</p>
             <h2>${verificationCode}</h2>`,
    });

    return { user: newUser, code: verificationCode };

  } catch (error: unknown) {
    if (error && (error as ErrorWithCode)?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);
      
      // For existing users, generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Your Verification Code",
        html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
      });
      
      return { user: existingUser.users[0], code: verificationCode };
    }
    console.error("Error creating user:", error);
    throw error;
  }
};
