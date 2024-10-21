import "katex/dist/katex.min.css";

import { BlockMath, InlineMath } from "react-katex";

import React from "react";

const splitFormula = (formula) => {
  const parts = formula.split(/(\$\$.*?\$\$)/);
  return parts.map((part) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      return { type: "math", content: part.slice(2, -2) };
    }
    return { type: "text", content: part };
  });
};

const FormulaModal = ({ isOpen, onClose, id, formula, title }) => {
  if (!isOpen) return null;

  const cleanFormula = formula.replace(/^\$\$|\$\$$/g, "");

  const renderFormula = () => {
     if (!formula || formula.trim() === '') {
    return <p>Not specified</p>;
  }
  
    if (title === "Consistency" || title === "Semantical Redundancy") {
      const parts = splitFormula(formula);
      return parts.map((part, index) => (
        <span key={index}>
          {part.type === "math" ? (
            <InlineMath math={part.content} />
          ) : (
            part.content
          )}
        </span>
      ));
    } else {
      return <InlineMath math={cleanFormula} />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4"
      id="my-modal"
    >
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-[70%] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center">
          <Link href={`/repo/metrics/${id}`} className="text-xl font-semibold text-gray-900 mb-4">
            {title || "Formula"}
          </Link>
          <div className="overflow-hidden text-center mb-6">
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
