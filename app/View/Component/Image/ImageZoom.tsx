import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageZoomProps {
    src: string;
    alt: string;
    quality?: number;
    zoomScale?: number; // How much to zoom (2 = 200%, 3 = 300%)
}

const ImageZoom: React.FC<ImageZoomProps> = ({
                                                 src,
                                                 alt,
                                                 quality = 90,
                                                 zoomScale = 2.5
                                             }) => {
    const [isZooming, setIsZooming] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setMousePosition({ x, y });
    };

    const handleMouseEnter = () => {
        setIsZooming(true);
    };

    const handleMouseLeave = () => {
        setIsZooming(false);
    };

    return (
        <div
            ref={imageRef}
            className="relative w-full h-full overflow-hidden cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Original Image */}
            <Image
                src={src}
                fill
                alt={alt}
                style={{
                    objectFit: "contain",
                    transition: isZooming ? 'opacity 0.3s ease' : 'none',
                    opacity: isZooming ? 0 : 1
                }}
                priority
                quality={quality}
                sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Zoomed Image */}
            {isZooming && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: `${zoomScale * 50}%`,
                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}
        </div>
    );
};

export default ImageZoom;
