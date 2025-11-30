import {z} from "zod";
import {
    adminAddUserSchema,
    createUserSchema,
    adminEditUserSchema,
    userEditUserSchema
} from "@/app/busniessLogic/User/userValidation";
import {IdAndRole, Role} from "@prisma/client";
import prisma from "@/prisma/client";
import {hash} from "bcryptjs";
import _ from "lodash";
import {removeUndefinedValues} from "@/app/Util/updateHelper";
import {Credential} from "@/app/Util/constants/session";
import {NextResponse} from "next/server";
import {getCredentialAndUserId, validateUserId} from "@/app/services/RoleAndCredentialCheck";

type UserForm = z.infer<typeof createUserSchema>;
type AddUserForm = z.infer<typeof adminAddUserSchema>;
type EditUserForm = z.infer<typeof adminEditUserSchema>;
type UserEditForm = z.infer<typeof userEditUserSchema>;

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
        throw new UserCreationError("email", "A user with this email already exists");
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

async function isEmailAlreadyExists(bean: {email: string, id: string}) {
    const existingEmail = await prisma.login.findFirst({
        where: {
            communicationChannel: bean.email,
            userId: { not: bean.id }
        }
    });
    return !!existingEmail;
}

async function isUsernameAlreadyExists(bean: {username: string, id: string}) {
    const existingUser = await prisma.login.findFirst({
        where: {
            userName: bean.username,
            userId: { not: bean.id }
        }
    });
    return !!existingUser;
}

export async function updateUser(bean: EditUserForm | UserEditForm, cred: Credential, id: string) {
    const user = await prisma.user.findUnique({
        where: { id: id },
        include: { login: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role === Role.ROOT && !cred.isRoot()) {
        throw new Error("Only ROOT users can update ROOT users");
    }

    // Check if email is being changed and if it already exists
    if (bean.email && bean.email !== user.email) {
        if (await isEmailAlreadyExists({ email: bean.email, id })) {
            throw new UserCreationError('email', "A user with this email already exists");
        }
    }

    // Check if username is being changed and if it already exists (admin edit only)
    if ('userName' in bean && bean.userName && bean.userName !== user.login?.userName) {
        if (await isUsernameAlreadyExists({username: bean.userName, id})) {
            throw new UserCreationError('userName', "This username is already taken");
        }
    }

    // Separate address, userName, and email from other fields
    // userName and email go to Login table, not User table
    const { address, email, userName, ...userFields } = 'userName' in bean
        ? bean  // EditUserForm has userName
        : { ...bean, userName: undefined };  // UserEditForm doesn't have userName

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

export async function activateUser(userId: string, activatedBy: IdAndRole | null) {
    if (!activatedBy || (activatedBy.role !== Role.ADMIN && activatedBy.role !== Role.ROOT)) {
        throw new Error("You are not authorized to activate users");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Activate user by setting isActive to true
    return prisma.user.update({
        where: {id: userId},
        data: {isActive: true}
    });
}

