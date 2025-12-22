import phoneNumber, {PhoneNumber} from "@/app/Util/phoneNumber";
import {Address} from "@prisma/client";

export const TAX : number = 0.1;
export const CUSTOMER_SUPPORT_PHONE_NUMBER: phoneNumber = new PhoneNumber("+16263213319");
export const CUSTOMER_SUPPORT_EMAIL:string = "customersupport@thitser.com";
export const COMPANY_ADDRESS: Omit<Address, 'id' | 'userId'> = {
    street1: "123 Main Street",
    street2: "Suite 100",
    city: "Los Angeles",
    zip: "90001",
    country: "United States"
};