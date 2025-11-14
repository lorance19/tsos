import React from 'react';
import {FaArchive, FaUser} from "react-icons/fa";
import {CiSearch} from "react-icons/ci";
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";
import {IoMdPersonAdd} from "react-icons/io";
import {IoAdd} from "react-icons/io5";

function Page() {
    return (
        <div className="p-2 m-2 w-full">
            <div className="flex flex-row justify-between align-items-center">
                <p className="flex items-center text-2xl font-semibold">
                    <FaArchive className="mx-2"/>
                    <span>Product Management</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <label className="input col-span-2">
                        <CiSearch />
                        <input
                            type="search"
                            placeholder="Search"
                        />
                    </label>
                    <Link className="btn btn-primary rounded-full" href={ADMIN_MANAGEMENTS.ADD_PRODUCT.VIEW}><IoAdd className="text-xl"/></Link>
                </div>
            </div>

        </div>
    );
}

export default Page;