import React from 'react';
import { FaUser } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { IoMdPersonAdd } from "react-icons/io";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";


function Page() {
    return (
        <div className="p-2 m-2 w-full">
            <div className="flex flex-row justify-between align-items-center">
                <p className="flex items-center text-3xl font-semibold">
                    <FaUser className="mx-2"/>
                    <span>Users</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <label className="input col-span-2">
                        <CiSearch />
                        <input type="search" required placeholder="Search" />
                    </label>
                    <Link className="btn btn-primary rounded-full" href={ADMIN_MANAGEMENTS.PATH.ADD_USER}><IoMdPersonAdd className="text-xl"/></Link>
                </div>
            </div>
            <div className="card bg-base-100 shadow-sm w-full m-2 p-2">
                <div className="card-body">
                    hello
                </div>
            </div>
        </div>
    );
}

export default Page;