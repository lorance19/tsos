'use server'

import {deleteSession} from "@/app/Util/constants/session";
import {redirect} from "next/navigation";

export async function signOut() {
    await deleteSession();
    redirect('/');
}