import "katex/dist/katex.min.css";

import { InlineMath } from "react-katex";

import Link from "next/link";
import React from "react";

const FormulaModal = ({ isOpen, onClose, id, formula, title }) => {
	if (!isOpen) return null;

	const renderFormula = () => {
		if (!formula || formula.trim() === "") {
			return <p>Not specified</p>;
		}

		return (
			<div className="w-full overflow-x-auto">
				<div className="inline-block min-w-full">
					<InlineMath
						math={formula}
						style={{
							display: "block",
							overflowWrap: "break-word",
							wordWrap: "break-word",
							whiteSpace: "normal",
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
			<div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl mx-auto">
				<div className="flex flex-col items-center space-y-6">
					<Link
						href={`/repo/metrics/${id}`}
						className="text-2xl font-semibold text-blue hover:text-indigo transition-colors"
					>
						{title || "Formula"}
					</Link>
					<div className="w-full flex justify-center">
						<div className="max-w-2xl w-full">{renderFormula()}</div>
					</div>
					<button
						className="mt-6 px-6 py-2 bg-blue text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo transition-colors focus:outline-none focus:ring-2 focus:ring-blue"
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
