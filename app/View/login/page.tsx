'use client'
import React from 'react';
import {
    userLoginValidationSchema,
    userLoginValidationSchemaKey
} from "@/app/busniessLogic/User/userValidation";
import {z} from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FaRegUser} from "react-icons/fa";
import ErrorMessage from "@/app/View/Component/ErrorMessage";
import {GrKey} from "react-icons/gr";
import {userLogin} from "@/app/busniessLogic/User/userManager";
import SubmitButton from "@/app/View/Component/SubmitButton";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {SIGN_UP} from "@/app/Util/constants/paths";

export type LoginForm = z.infer<typeof userLoginValidationSchema>

function Login() {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(userLoginValidationSchema),
    });

    const loginMutation = userLogin();
    const {isPending, isError, error } = loginMutation;
    const onSubmit: SubmitHandler<LoginForm> = (data) => {
        loginMutation.mutate(data, {
            onSuccess: ()=> {
                router.push("/")
            }
        })
    }
    return (
        <form className="flex justify-center mt-5" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="w-full max-w-md" disabled={isPending}>
                <label className="input input-bordered w-full m-2">
                    <span className="opacity-70"><FaRegUser/></span>
                    <input type="text" placeholder="Username" {...register(userLoginValidationSchemaKey.username)} />
                </label>
                <ErrorMessage>{errors.username?.message}</ErrorMessage>
                <label className="input input-bordered w-full m-2">
                    <span className="opacity-70"><GrKey/></span>
                    <input type="password" placeholder="Password" {...register(userLoginValidationSchemaKey.password)} />
                </label>
                <ErrorMessage>{errors.password?.message}</ErrorMessage>
                <div className="flex lg:flex-row md:flex-row flex-col gap-2">
                    <Link className="btn btn-success w-full md:w-1/2 lg:w-1/2" href={SIGN_UP.VIEW}>Sign Up</Link>
                    <SubmitButton className="btn btn-primary w-full md:w-1/2 lg:w-1/2" text="Login" isSubmitting={isPending}/>
                </div>
                {isError && (
                    <ErrorMessage>{error.message}</ErrorMessage>
                )}
            </fieldset>
        </form>
    );
}

export default Login;
