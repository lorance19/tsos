import {z} from "zod";
import {adminAddUserSchema, createUserSchema} from "@/app/busniessLogic/User/userValidation";
import {IdAndRole, Role, User} from "@prisma/client";
import prisma from "@/prisma/client";
import {hash} from "bcryptjs";
import _ from "lodash";

type UserForm = z.infer<typeof createUserSchema>;
type AddUserForm = z.infer<typeof adminAddUserSchema>;

export class UserCreationError extends Error {
    constructor(public field: string, message: string) {
        super(message);
        this.name = 'UserCreationError';
    }
}

export async function findUserById(userId: string) {
    return prisma.user.findUnique({where: {id: userId}});
}

async function isExistingEmail(email: string ) {
    const isExistingEmail = await prisma.login.count({
        where: { communicationChannel: email }
    });
    return isExistingEmail > 0;
}

async function isExistingUsername(userName: string ) {
    const isExistingUserName = await prisma.login.count({
        where: { communicationChannel: userName }
    });
    return isExistingUserName > 0;
}

export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: { id: id},
        include: {
            login: {
                select: {
                    userName: true,
                    communicationChannel: true,
                }
            }
        }
    });
}

export async function getAllUsersExceptId(cred: IdAndRole) {
    return prisma.user.findMany({
        where: {
            isActive: true,
            id: {not: cred!.userId}
        },
        include: {
            login: {
                select: {
                    userName: true,
                    communicationChannel: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function createUserByAdmin(bean: AddUserForm, createdBy: IdAndRole | null) {
    if (!createdBy || (createdBy.role !== Role.ADMIN && createdBy.role !== Role.ROOT)) {
        throw new Error("You are not authorized to create User");
    }

    if (await isExistingEmail(bean.email)) {
        throw new UserCreationError('email', "A user with this email already exists");
    }
    if (await isExistingUsername(bean.userName)) {
        throw new UserCreationError('userName', "Please choose a different username");
    }
    const hashedPassword = await hash(bean.password, 10);
    const newUser = await prisma.user.create({
        data: {
            email: bean.email,
            role: bean.role,
            firstName: _.toUpper(bean.firstName),
            lastName: _.toUpper(bean.lastName),
            phone: bean.phone,
            createdBy: createdBy
        },
    });

    const user = await prisma.login.create({
        data: {
            userId: newUser.id,
            role: newUser.role,
            password: hashedPassword,
            communicationChannel: newUser.email,
            userName: bean.userName
        }
    });

    return {
        user: newUser,
        login: user
    };
}

export async function createUser(bean: UserForm, role: Role) {

    if (!role) {
        throw new Error("User ID or Role is missing");
    }

    if (await isExistingEmail(bean.email)) {
        throw new UserCreationError('email', "A user with this email already exists");
    }

    if (await isExistingUsername(bean.userName)) {
        throw new UserCreationError('userName', "Please choose a different username");
    }

    // ✅ Hash password
    const hashedPassword = await hash(bean.password, 10);

    // ✅ Create user
    const newUser = await prisma.user.create({
        data: { email: bean.email, role: role },
    });

    // ✅ Create login record
    const user = await prisma.login.create({
        data: {
            userId: newUser.id,
            role: newUser.role,
            password: hashedPassword,
            communicationChannel: newUser.email,
            userName: bean.userName
        }
    });

    return {
        user: newUser,
        login: user
    };
}

export async function deleteUser(userId: string, deletedBy: IdAndRole | null) {
    if (!deletedBy || (deletedBy.role !== Role.ADMIN && deletedBy.role !== Role.ROOT)) {
        throw new Error("You are not authorized to delete users");
    }

    // Prevent deleting ROOT users
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role === Role.ROOT) {
        throw new Error("ROOT users cannot be deleted");
    }

    // Soft delete by setting isActive to false
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
    });

    return updatedUser;
}