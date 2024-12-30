import React from "react";
import { useSearchParams } from "next/navigation";

export function MyPagination({ resPerPage, totalItemsCount, setCurrentPage }) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);

  const totalPages = Math.ceil(totalItemsCount / resPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${currentPage === i
              ? "bg-blue text-white"
              : "bg-white text-blue hover:bg-indigo hover:text-white"
            }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div>
      {resPerPage < totalItemsCount && (
        <div className="flex justify-center items-center mb-12">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 rounded bg-white text-blue hover:bg-indigo hover:text-white disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 rounded bg-white text-blue hover:bg-indigo hover:text-white disabled:opacity-50"
          >
            Prev
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 rounded bg-white text-blue hover:bg-indigo hover:text-white disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 rounded bg-white text-blue hover:bg-indigo hover:text-white disabled:opacity-50"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
