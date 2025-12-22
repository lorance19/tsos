'use client'
import React from 'react';

function ContactUs() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:mx-96">
            <div className="flex justify-center p-5 mt-5">
                <div className="flex-col justify-start p-3">
                    <p className="text-4xl font-roboto mb-10 text-secondary">Contact Us</p>
                    <p className="text-gray-600 text-2xl mb-10">We are committed to processing the information in order to contact you and talk about your project</p>

                </div>

            </div>
            <div className="flex justify-center">
                <p className="text-2xl font-bold text-secondary">Contact Us</p>
            </div>
        </div>
    );
}

export default ContactUs;