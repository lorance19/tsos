import React from 'react';
import {UseFormRegister, FieldErrors} from 'react-hook-form';
import {CiCreditCard1, CiMail, CiUser, CiCircleCheck} from 'react-icons/ci';
import {AiOutlineExclamationCircle} from 'react-icons/ai';
import {z} from 'zod';
import {orderValidation} from '@/app/busniessLogic/Order/orderValidation';

type ShippingForm = z.infer<typeof orderValidation>;

interface BillingInformationProps {
    register: UseFormRegister<ShippingForm>;
    errors: FieldErrors<ShippingForm>;
    selectedPaymentMethod?: string;
}

export function BillingInformation({register, errors, selectedPaymentMethod}: BillingInformationProps) {
    return (
        <div>
            <p className="text-2xl font-montserrat mt-3">Billing Information</p>
            <div className="py-5">
                {/* Payment Method Selection */}
                <div className="form-control mb-4">
                    <label className={`input validator ${errors.paymentMethod?.method ? 'input-error' : ''}`}>
                        <CiCreditCard1 size={20}/>
                        <select
                            className="select h-2 !border-none !outline-none focus:!border-none focus:!outline-none
                            active:!border-none active:!outline-none"
                            {...register('paymentMethod.method')}
                        >
                            <option value="">Select Payment Method</option>
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="DEBIT_CARD">Debit Card</option>
                            <option value="PAYPAL">PayPal</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                        </select>
                        {errors.paymentMethod?.method && (
                            <small className="validator-hint visible text-error my-0">
                                {errors.paymentMethod?.method.message}
                            </small>
                        )}
                    </label>
                </div>

                {/* Card Details - Show only for Credit/Debit Card */}
                {(selectedPaymentMethod === 'CREDIT_CARD' || selectedPaymentMethod === 'DEBIT_CARD') && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
                        <div className="form-control">
                            <label
                                className={`input validator lg:w-full ${errors.paymentMethod?.cardNumber ? 'input-error' : ''}`}>
                                <CiCreditCard1 size={20}/>
                                <input
                                    {...register('paymentMethod.cardNumber')}
                                    type="text"
                                    placeholder="Card Number"
                                    maxLength={19}
                                />
                                {errors.paymentMethod?.cardNumber && (
                                    <small className="validator-hint visible my-0 text-error">
                                        {errors.paymentMethod.cardNumber.message}
                                    </small>
                                )}
                            </label>
                        </div>
                        <div className="form-control">
                            <label
                                className={`input validator lg:w-full ${errors.paymentMethod?.cardholderName ? 'input-error' : ''}`}>
                                <CiUser size={20}/>
                                <input
                                    {...register('paymentMethod.cardholderName')}
                                    type="text"
                                    placeholder="Cardholder Name"
                                />
                                {errors.paymentMethod?.cardholderName && (
                                    <small className="validator-hint visible my-0 text-error">
                                        {errors.paymentMethod.cardholderName.message}
                                    </small>
                                )}
                            </label>
                        </div>
                        <div className="form-control">
                            <label
                                className={`input lg:w-full validator ${errors.paymentMethod?.expiryDate ? 'input-error' : ''}`}>
                                <input
                                    {...register('paymentMethod.expiryDate')}
                                    type="text"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                />
                                {errors.paymentMethod?.expiryDate && (
                                    <small className="validator-hint visible my-0 text-error">
                                        {errors.paymentMethod.expiryDate.message}
                                    </small>
                                )}
                            </label>
                        </div>
                        <div className="form-control">
                            <label
                                className={`input lg:w-full validator ${errors.paymentMethod?.cvv ? 'input-error' : ''}`}>
                                <input
                                    {...register('paymentMethod.cvv')}
                                    type="text"
                                    placeholder="CVV"
                                    maxLength={4}
                                />
                                {errors.paymentMethod?.cvv && (
                                    <small className="validator-hint visible my-0 text-error">
                                        {errors.paymentMethod.cvv.message}
                                    </small>
                                )}
                            </label>
                        </div>
                    </div>
                )}

                {/* PayPal Email - Show only for PayPal */}
                {selectedPaymentMethod === 'PAYPAL' && (
                    <div className="form-control mt-4">
                        <label className={`input validator ${errors.paymentMethod?.paypalEmail ? 'input-error' : ''}`}>
                            <CiMail size={20}/>
                            <input
                                {...register('paymentMethod.paypalEmail')}
                                type="email"
                                placeholder="PayPal Email"
                            />
                            {errors.paymentMethod?.paypalEmail && (
                                <small className="validator-hint visible my-0 text-error">
                                    {errors.paymentMethod.paypalEmail.message}
                                </small>
                            )}
                        </label>
                    </div>
                )}

                {/* Bank Transfer Instructions */}
                {selectedPaymentMethod === 'BANK_TRANSFER' && (
                    <div className="alert alert-info alert-soft mt-4">
                        <AiOutlineExclamationCircle/>
                        <span>Bank transfer instructions will be sent to your email after order confirmation.</span>
                    </div>
                )}

                {/* Cash on Delivery Message */}
                {selectedPaymentMethod === 'CASH_ON_DELIVERY' && (
                    <div className="alert alert-success mt-4 alert-soft">
                        <CiCircleCheck/>
                        <span>Pay with cash when your order is delivered.</span>
                    </div>
                )}
            </div>
        </div>
    );
}