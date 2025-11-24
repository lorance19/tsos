import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const maxVisiblePages = 5;
        const pages: number[] = [];

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= 3) {
            // Show first 5 pages
            for (let i = 1; i <= maxVisiblePages; i++) {
                pages.push(i);
            }
        } else if (currentPage >= totalPages - 2) {
            // Show last 5 pages
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show current page and 2 pages on each side
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 my-4">
            <button
                className="btn btn-sm"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                First
            </button>
            <button
                className="btn btn-sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            <div className="flex gap-1">
                {pageNumbers.map((pageNum) => (
                    <button
                        key={pageNum}
                        className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => onPageChange(pageNum)}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>

            <button
                className="btn btn-sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
            <button
                className="btn btn-sm"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                Last
            </button>

            <span className="text-sm ml-4">
                Page {currentPage} of {totalPages}
            </span>
        </div>
    );
}

export default Pagination;