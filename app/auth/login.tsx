'use server'
import {createSession} from "@/app/Util/constants/session";
import {LoginForm} from "@/app/View/login/page";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/client";
import {findUserById} from "@/app/services/UserService";
import {updateLoginTime} from "@/app/services/LoginService";

//Signup route
export async function getUser(data: LoginForm) {
   const existingUser = await findByUserName(data.username)
   if (!existingUser) {
      throw new Error("Invalid username or password");
   }
   const isPwMatch = await bcrypt.compare(data.password, existingUser.password);
   if (!isPwMatch) {
      throw new Error("Invalid username or password");
   }
   const user = await findUserById(existingUser.userId);
   if (!user) {
      throw new Error("Sorry, your account is removed");
   }
   if (!user.isActive) {
      throw new Error("You account has been deactivated. Please contact customer support for further information.");
   }
   await createSession({userId: user.id, role: user.role, name: (user.firstName || user.lastName)
          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
          : null})
   await updateLoginTime(user.id);
   return existingUser;
}


async function findByUserName(userName: string) {
   return prisma.login.findFirst({where: {userName: userName}});
}