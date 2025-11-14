'use client'
import React, {useState} from 'react';
import Image from "next/image";

export interface ProductImageProps {
    image:string;
    hoverImage?:string;
    primaryBadge?:badge;
    link:string;
    title:string;
    description?:string;
    price?: number;

}

interface badge {
    text: string;
    bgColor?: string; // For custom badge colors
}

function ImageWithBadgeAtTop({ image, hoverImage, primaryBadge, title }: ProductImageProps) {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div>
            <div
                className="relative h-[25rem] overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

                {/* Badge */}
                {primaryBadge && (
                    <div className="absolute px-2 py-1 text-sm font-bold bg-amber-700 text-white shadow-lg z-10 pointer-events-none">
                        {primaryBadge.text}
                    </div>
                )}

                {/* Main Image */}
                <Image
                    src={image}
                    alt={title}
                    fill
                    style={{objectFit: "cover"}}
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="transition-all duration-400 ease-in-out hover:cursor-pointer"
                />

                {/* Hover Image - overlaid on top */}
                {hoverImage && (
                    <Image
                        src={hoverImage}
                        alt={`${title} - alternate view`}
                        fill
                        style={{objectFit: "cover"}}
                        quality={90}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`absolute inset-0 transition-opacity duration-400 ease-in-out ${
                            isHovered ? 'opacity-100 cursor-pointer' : 'opacity-0'
                        }`}
                    />
                )}
            </div>
        </div>
    );
}

export default ImageWithBadgeAtTop;