"use client";

import { useRouter } from "next/navigation";

const Legend = () => {
	const router = useRouter();

	const faqs = [
		{
			question: "How metrics are calculated?",
			answer: "TO-DO",
		},
		{
			question:
				"When do I need to upload .decl and .dot files when creating a model?",
			answer: "TO-DO",
		},
		{
			question: "Which of the metrics are calculated?",
			answer: "TO-DO",
		},
		{
			question:
				"Where can I specify the purpose and application domain of a model?",
			answer: "TO-DO",
		},
		{
			question: "Where are uploaded files stored?",
			answer: "TO-DO",
		},
		{
			question:
				"Do you recommend any template for .txt, .decl, .dot, and image?",
			answer:
				"The recommendation is to export automata, Declare model, and textual representation from RuM. Alongside that, take a screenshot of the image from RuM.",
		},
		{
			question:
				"What is the difference between text representation and description?",
			answer:
				"Text representation typically includes details like the automata, Declare model, and textual representation exported from RuM. Descriptions, on the other hand, provide contextual information and explanations about the model.",
		},
	];

	const renderBibtex = () => {
		return (
			<pre className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 overflow-auto">
				{`@misc{declarerepo2025,
  author = {Bartosz Ziolkowski},
  title = {Declare Repository: Declarative Process Models and Characteristics},
  howpublished = {\\url{https://declare-repo.vercel.app/}},
  year = {2025},
}`}
			</pre>
		);
	};

	return (
		<div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white shadow-lg rounded-lg overflow-hidden">
					<div className="px-6 py-8">
						<div className="flex justify-between items-center mb-8">
							<h1 className="text-3xl font-bold text-gray-900">
								Getting Started
							</h1>
							<div className="flex space-x-4">
							<button
									onClick={() => router.push("/api-docs")}
									className="bg-blue hover:bg-orange hover:text-black text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
								>
									API Documentation
								</button>
								<button
									onClick={() => router.back()}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
								>
									Back
								</button>
								
							</div>
						</div>

						{/* FAQ Section */}
						<div className="mb-12">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">FAQs</h2>
							<div className="space-y-6">
								{faqs.map((faq, index) => (
									<div key={index} className="bg-gray-50 rounded-lg p-6">
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{faq.question}
										</h3>
										<p className="text-gray-700">{faq.answer}</p>
									</div>
								))}
							</div>
						</div>

						{/* References Section */}
						<div className="mb-12">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								References
							</h2>
							<div>{renderBibtex()}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Legend;
