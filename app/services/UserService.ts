import {z} from "zod";
import {adminAddUserSchema, createUserSchema, editUserSchema} from "@/app/busniessLogic/User/userValidation";
import {IdAndRole, Role} from "@prisma/client";
import prisma from "@/prisma/client";
import {hash} from "bcryptjs";
import _ from "lodash";
import {removeUndefinedValues} from "@/app/Util/updateHelper";

type UserForm = z.infer<typeof createUserSchema>;
type AddUserForm = z.infer<typeof adminAddUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

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
            },
            address: true,
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

export async function updateUser(bean: EditUserForm, updatedBy: IdAndRole | null, id: string) {
    // If updatedBy is null, it means user is updating themselves (allowed)
    if (updatedBy && (updatedBy.role !== Role.ADMIN && updatedBy.role !== Role.ROOT)) {
        throw new Error("You are not authorized to update users");
    }

    const user = await prisma.user.findUnique({
        where: { id: id },
        include: { login: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role === Role.ROOT && updatedBy?.role !== Role.ROOT) {
        throw new Error("Only ROOT users can update ROOT users");
    }

    // Check if email is being changed and if it already exists
    if (bean.email && bean.email !== user.email) {
        const existingEmail = await prisma.login.findFirst({
            where: {
                communicationChannel: bean.email,
                userId: { not: id }
            }
        });
        if (existingEmail) {
            throw new UserCreationError('email', "A user with this email already exists");
        }
    }

    // Check if username is being changed and if it already exists
    if (bean.userName && bean.userName !== user.login?.userName) {
        const existingUsername = await prisma.login.findFirst({
            where: {
                userName: bean.userName,
                userId: { not: id }
            }
        });
        if (existingUsername) {
            throw new UserCreationError('userName', "This username is already taken");
        }
    }

    // Separate address from other fields
    const { address, userName, email, ...userFields } = bean;

    // Clean undefined/null values - only update fields that are present
    const cleanedUserFields = removeUndefinedValues({
        ...userFields,
        firstName: userFields.firstName ? _.toUpper(userFields.firstName) : undefined,
        lastName: userFields.lastName ? _.toUpper(userFields.lastName) : undefined,
    });

    // Update User table
    await prisma.user.update({
        where: { id: id },
        data: cleanedUserFields
    });

    // Update Address if provided
    if (address) {
        const cleanedAddress = removeUndefinedValues(address) as {
            street1?: string;
            street2?: string;
            city?: string;
            zip?: string;
            country?: string;
        };

        if (Object.keys(cleanedAddress).length > 0) {
            await prisma.address.upsert({
                where: { userId: id },
                create: {
                    userId: id,
                    street1: cleanedAddress.street1 || '',  // street1 is required in schema
                    street2: cleanedAddress.street2,
                    city: cleanedAddress.city,
                    zip: cleanedAddress.zip,
                    country: cleanedAddress.country
                },
                update: cleanedAddress
            });
        }
    }

    // Update Login table if email or userName changed
    if (user.login && (userName || email)) {
        const loginUpdates = removeUndefinedValues({
            userName: userName,
            communicationChannel: email
        });

        if (Object.keys(loginUpdates).length > 0) {
            await prisma.login.update({
                where: { userId: id },
                data: loginUpdates
            });
        }
    }

    // Return updated user with relations
    return await getUserById(id);
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
    return prisma.user.update({
        where: {id: userId},
        data: {isActive: false}
    });
}