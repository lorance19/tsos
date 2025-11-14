import React from 'react';
import Link from "next/link";
import {ADMIN_MANAGEMENTS} from "@/app/Util/constants/paths";

function AddNewProduct() {
    return (
        <div className=" m-2 p-2 w-full">
            <div className="breadcrumbs text-sm">
                <ul>
                    <li><Link className="link-primary" href={ADMIN_MANAGEMENTS.PRODUCTS.VIEW}>Product Management</Link>
                    </li>
                    <li>Add New Product</li>
                </ul>
            </div>
            <p className="text-xl font-semibold">Add New Product</p>
            <form>
                <div className="grid grid-rows-7 grid-cols-2 gap-4">

                </div>

            </form>
        </div>
    );
}

export default AddNewProduct;