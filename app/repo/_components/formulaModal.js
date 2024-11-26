import "katex/dist/katex.min.css";

import { InlineMath } from "react-katex";

import Link from "next/link";
import React from "react";



const FormulaModal = ({ isOpen, onClose, id, formula, title }) => {
  if (!isOpen) return null;

  const renderFormula = () => {
    if (!formula || formula.trim() === '') {
      return <p>Not specified</p>;
    }

    return (
      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full">
          <InlineMath 
            math={formula} 
            style={{
              display: 'block',
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4"
      id="my-modal"
    >
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-[90%] md:max-w-[70%] max-h-[90vh]">
        <div className="flex flex-col items-center">
          <Link 
            href={`/repo/metrics/${id}`} 
            className="text-xl font-semibold text-blue hover:text-indigo mb-4"
          >
            {title || "Formula"}
          </Link>
          <div className="w-full text-left mb-6">
            {renderFormula()}
          </div>
          <button
            className="px-4 py-2 bg-blue text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo focus:outline-none focus:ring-2 focus:ring-blue"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default FormulaModal;
