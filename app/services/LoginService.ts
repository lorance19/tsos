import prisma from "@/prisma/client";

const MAX_LOGIN_HISTORY = 100; // Keep only the last 10 login times

export async function updateLoginTime(userId: string) {
    const currentLogin = await prisma.login.findUnique({
        where: { userId: userId }
    });

    if (!currentLogin) {
        throw new Error("Login record not found");
    }

    const loginTimes = (currentLogin.lastLogin as Date[]) || [];
    const updatedLoginTimes = [...loginTimes, new Date()];
    const trimmedLoginTimes = updatedLoginTimes.slice(-MAX_LOGIN_HISTORY);
    return prisma.login.update({
        where: { id: currentLogin.id },
        data: { lastLogin: { set: trimmedLoginTimes } }
    });
}