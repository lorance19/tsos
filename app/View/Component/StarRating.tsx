import {BsStarFill, BsStarHalf} from "react-icons/bs";
import _ from "lodash";

function StarRating({ rating }: { rating: number })  {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    if (!rating) {
        return (
            <p className="italic text-sm px-2">No rating yet</p>
        )
    }
    return (
        <div className="flex my-1">
            {/* Full stars */}
            {_.times(fullStars, (index) => (
                <BsStarFill key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}

            {/* Half star */}
            {hasHalfStar && (
                <div className="relative">
                    <BsStarHalf className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
            )}
        </div>
    );
}

export default StarRating;