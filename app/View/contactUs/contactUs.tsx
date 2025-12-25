'use client'
import React from 'react';
import {IoLocationSharp, IoMailSharp, IoPhonePortraitSharp} from "react-icons/io5";
import {COMPANY_ADDRESS, CUSTOMER_SUPPORT_EMAIL, CUSTOMER_SUPPORT_PHONE_NUMBER} from "@/app/Util/constants/constants";
import ContactForm from "@/app/View/Component/ContactForm";

function ContactUs() {
    return (
        <div className="py-10">

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-5">
                {/* Left side - Information */}
                <div className="flex justify-center items-center">
                    <div className="flex-col justify-start space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-secondary">Contact Us</h1>
                        <p className="text-gray-600 text-lg md:text-xl">
                            We are committed to processing your information in order to contact you and discuss your needs.
                        </p>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h3 className="font-semibold text-lg">Get in Touch</h3>
                                <p className="text-base">Have questions or need support? Fill out the form and we'll respond as soon as possible.</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p className="font-montserrat text-xl flex items-center gap-8"><IoMailSharp className="text-secondary text-3xl flex-shrink-0"/> {CUSTOMER_SUPPORT_EMAIL}</p>
                            <p className="font-montserrat text-xl flex items-center gap-8"><IoPhonePortraitSharp className="text-secondary text-3xl flex-shrink-0"/> {CUSTOMER_SUPPORT_PHONE_NUMBER.toFormattedString()}</p>
                            <p className="font-montserrat text-xl flex items-center gap-8"><IoLocationSharp className="text-secondary text-3xl flex-shrink-0"/> {COMPANY_ADDRESS.toFormattedString()}</p>

                        </div>
                    </div>
                </div>

                {/* Right side - Contact Form */}
                <ContactForm />
            </div>
        </div>
    );
}

export default ContactUs;