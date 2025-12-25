import phoneNumber, {PhoneNumber} from "@/app/Util/phoneNumber";
import addressFormatter, {AddressFormatter} from "@/app/Util/addressFormatter";

export const TAX : number = 0.1;
export const CUSTOMER_SUPPORT_PHONE_NUMBER: phoneNumber = new PhoneNumber("+16263213319");
export const CUSTOMER_SUPPORT_EMAIL:string = "customersupport@thitser.com";
export const COMPANY_ADDRESS: addressFormatter = new AddressFormatter({
    street1: "123 Main Street",
    street2: "Suite 100",
    city: "Los Angeles",
    zip: "90001",
    country: "United States"
});