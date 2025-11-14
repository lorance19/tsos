import Image from "next/image";

interface cardProps {
    image:string;
    title:string;
    buttonText?:string;
    link?:string;
    description:string;
}

import React from 'react';
import {FaArrowRightLong} from "react-icons/fa6";

function ImageMainCard(props: cardProps) {
    return (
        <div className="h-[40rem] m-1 overflow-hidden font-serif">
            <div className="relative h-2/3 w-full">
                <Image
                    src={props.image}
                    alt={props.title}
                    fill
                    style={{objectFit: "cover"}}
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <p className="text-secondary-content text-2xl my-3">{props.title}</p>
            <p className="text-black test-base ">{props.description}</p>
            <button className="btn btn-lg w-2/3 bg-secondary-content my-3
                transition ease-in-out  
                 hover:shadow-xl
                 hover:scale-102
                text-white font-light rounded-none">
                {props.buttonText} <FaArrowRightLong />
            </button>
        </div>
    );
}

export default ImageMainCard;