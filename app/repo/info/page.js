"use client";

import { useRouter } from "next/navigation";

const Legend = () => {
	const router = useRouter();

	const faqs = [
		{
			question: "How are metrics calculated?",
			answer:
				"Eight metrics - number of activities, number of constraints, consistency, semantic redundancy, separability, constraint variability, density, and size - are automatically calculated and assigned on the server side. Additionally, two characteristics, application domain and purpose, must be specified by a model's author.",
		},
		{
			question: "When do I need to upload .decl and .dot files when creating a model?",
			answer:
				"You need to upload a .decl file if you want the eight metrics to be automatically calculated.",
		},
		{
			question: "Where can I specify the purpose and application domain of a model?",
			answer: "You can specify them in the model editing panel.",
		},
		{
			question: "Where are uploaded files stored?",
			answer: "Uploaded files are stored in an Amazon Web Services (AWS) S3 bucket.",
		},
		{
			question: "Do you recommend any templates for .txt, .decl, .dot, and images?",
			answer:
				"We recommend exporting automata, Declare models, and textual representations from the desktop application called RuM - Rule Mining Made Simple. Additionally, take a screenshot of your model's image in RuM.",
		},
		{
			question: "What is the difference between textual representation and description?",
			answer:
				"Textual representation, exported from RuM, lists activities and constraints. Descriptions provide contextual information and explanations about the model, focusing on what the process is about.",
		},
	];


	const renderBibtex = () => {
		return (
			<pre className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 overflow-auto">
				{`@software{Ziolkowski_Declare_Repository_A_2025,
author = {Ziolkowski, Bartosz},
doi = {10.5281/zenodo.14609574},
license = {MIT},
month = jan,
title = {{Declare Repository: A web-based repository for storing, sharing and analyzing DECLARE process models}},
url = {https://github.com/bartosz-ziolkowski/declare-repo},
version = {1.0.0},
year = {2025}
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

						<div className="mb-12">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								If you use this software, please cite it as below:
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
