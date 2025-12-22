import React from 'react';
import Link from 'next/link';
import { PRODUCT } from '@/app/Util/constants/paths';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-base-300 text-base-content">
            <div className="container mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Shop Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Shop</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href={PRODUCT.LIST.VIEW} className="hover:text-secondary transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href={`${PRODUCT.LIST.VIEW}?filterType=curtain`} className="hover:text-secondary transition-colors">
                                    Curtains
                                </Link>
                            </li>
                            <li>
                                <Link href={`${PRODUCT.LIST.VIEW}?filterType=pillow`} className="hover:text-secondary transition-colors">
                                    Pillow Cases
                                </Link>
                            </li>
                            <li>
                                <Link href={`${PRODUCT.LIST.VIEW}?filterType=hardware`} className="hover:text-secondary transition-colors">
                                    Hardware
                                </Link>
                            </li>
                            <li>
                                <Link href={`${PRODUCT.LIST.VIEW}?sortBy=newest`} className="hover:text-secondary transition-colors">
                                    New Arrivals
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/View/Contact Us" className="hover:text-secondary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping-info" className="hover:text-secondary transition-colors">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="hover:text-secondary transition-colors">
                                    Returns & Exchanges
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-secondary transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/track-order" className="hover:text-secondary transition-colors">
                                    Track Order
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">About</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="hover:text-secondary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/our-story" className="hover:text-secondary transition-colors">
                                    Our Story
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-secondary transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="hover:text-secondary transition-colors">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Connect</h3>
                        <p className="text-sm mb-4">Follow us on social media for updates and inspiration</p>
                        <div className="flex gap-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                                <FaFacebook size={24} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                                <FaInstagram size={24} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                                <FaTwitter size={24} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                                <FaYoutube size={24} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-base-content/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4 text-sm">
                        <Link href="/terms" className="hover:text-secondary transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="hover:text-secondary transition-colors">
                            Privacy
                        </Link>
                    </div>
                    <p className="text-sm text-base-content/70">
                        © {currentYear} Thit Ser. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;