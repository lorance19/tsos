'use server'
import {createSession, getCredential} from "@/app/Util/constants/session";
import {LoginForm} from "@/app/View/login/page";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/client";
import {makeZodError} from "@/app/auth/route";
import {useMutation} from "@tanstack/react-query";
import {findUserById} from "@/app/busniessLogic/User/userManager";
import {redirect} from "next/navigation";

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
   await createSession({userId: user.id, role: user.role, name: (user.firstName || user.lastName)
          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
          : null})
   return existingUser;
}


async function findByUserName(userName: string) {
   return prisma.login.findFirst({where: {userName: userName}});
}