"use client";

import "katex/dist/katex.min.css";

import { useEffect, useState } from "react";

import { BlockMath } from "react-katex";
import DeleteConfirmationModal from "@/components/deleteModal";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useLoadingError } from "@/utils/client/context/loadingErrorContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DeclareModel = ({ params }) => {
	const router = useRouter();
	const { data: session, status: sessionStatus } = useSession();
	const [model, setModel] = useState(null);
	const { setIsLoading, setIsError } = useLoadingError();
	const [isAuthor, setIsAuthor] = useState(false);
	const [userRole, setUserRole] = useState("user");
	const [textRepContent, setTextRepContent] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [metrics, setMetrics] = useState([]);
	const [purpose, setPurpose] = useState("");
	const [customPurpose, setCustomPurpose] = useState("");
	const [applicationDomain, setApplicationDomain] = useState("");
	const [customDomain, setCustomDomain] = useState("");
	const [allDomains, setAllDomains] = useState([]);
	const [allPurposes, setAllPurposes] = useState([]);
	const [isVisible, setIsVisible] = useState(false);

	const handleVisibilityToggle = async () => {
		setIsLoading(true);

		try {
			const currentName = model?.name;
			const currentDescription = model?.description;
			const currentReference = model?.reference;

			const response = await fetch(`/api/repo/models/${params.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: currentName,
					description: currentDescription,
					reference: currentReference,
					public: !isVisible,
				}),
			});

			if (response.ok) {
				await fetchModel();
				if (!isVisible) {
					toast.success("Model is now visible to the public");
				} else {
					toast("Model is now hidden from the public");
				}
			} else {
				const data = await response.json();
				toast.error(data.message || "Failed to update visibility");
			}
		} catch (error) {
			setIsError(error);
		} finally {
			setIsLoading(false);
			setIsVisible(!isVisible);
		}
	};

	const fetchModel = async () => {
		if (!params.id) return;

		setIsLoading(true);
		try {
			const response = await fetch(`/api/repo/models/${params.id}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message);
			}

			setModel(data.model);
			setMetrics(data.metrics);
			setAllDomains(data.allDomains);
			setAllPurposes(data.allPurposes);
			setIsVisible(data.model.public);

			setPurpose(
				data.metrics.find((metric) => metric.ID === "SO1")?.calculationResult ||
				"custom",
			);
			setApplicationDomain(
				data.metrics.find((metric) => metric.ID === "SO2")?.calculationResult ||
				"custom",
			);

			if (data.model.textRepURL) {
				const textResponse = await fetch(data.model.textRepURL);
				if (textResponse.ok) {
					const textContent = await textResponse.text();
					setTextRepContent(textContent);
				}
			}
		} catch (err) {
			setIsError(err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchModel();
	}, [params.id]);

	useEffect(() => {
		if (sessionStatus === "authenticated" && model && model.author) {
			setIsAuthor(session.user._id === model.author._id);
			setUserRole(session.user.role);
			if (userRole === "moderator" || userRole === "admin") {
				setIsAuthor(true);
			}
		}
	}, [sessionStatus, session, model]);

	const handleDelete = () => {
		setShowDeleteModal(true);
	};

	const handlePurposeChange = (e) => {
		const value = e.target.value;
		setPurpose(value);
		if (value !== "custom") {
			setCustomPurpose("");
		}
	};

	const handleDomainChange = (e) => {
		const value = e.target.value;
		setApplicationDomain(value);
		if (value !== "custom") {
			setCustomDomain("");
		}
	};

	const confirmDelete = async () => {
		setShowDeleteModal(false);
		setIsLoading(true);
		try {
			const response = await fetch(`/api/repo/models/${params.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Model deleted successfully!");
				router.push("/repo");
			} else {
				const data = await response.json();
				toast.error(data.message);
			}
		} catch (error) {
			setIsError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = async (e, fileUrl, fileType = "decl") => {
		e.preventDefault();
		try {
			const response = await fetch(fileUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;

			const filename = fileType === "decl" ? "model.decl" : "automata.dot";
			a.download = filename;

			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			toast.error(`Failed to download file: ${error.message}`);
		}
	};

	const handleSubmit = async (field) => {
		const value =
			field === "SO1"
				? purpose === "custom"
					? customPurpose
					: purpose
				: applicationDomain === "custom"
					? customDomain
					: applicationDomain;
		setIsLoading(true);
		try {
			const response = await fetch(`/api/repo/models/${params.id}/metrics`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ [field]: value }),
			});

			if (response.ok) {
				await fetchModel();
				toast.success("Values of the metrics updated!");
			} else {
				const data = await response.json();
				toast.error(data.message);
			}
		} catch (error) {
			setIsError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const VisibilityToggle = ({ isVisible, onToggle }) => {
		return (
			<button
				onClick={onToggle}
				className={`flex items-center px-4 py-2 rounded-md transition-colors ${isVisible
					? "bg-green-500 hover:bg-green-600"
					: "bg-gray-400 hover:bg-gray-500"
					} text-white`}
			>
				{isVisible ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
						<path
							fillRule="evenodd"
							d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
							clipRule="evenodd"
						/>
					</svg>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5 opacity-50"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
							clipRule="evenodd"
						/>
						<path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
					</svg>
				)}
				<span className="ml-2">{isVisible ? "Visible" : "Hidden"}</span>
			</button>
		);
	};

	return (
		<div className="w-full px-6 py-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
				<div className="flex items-center gap-4 mb-4 sm:mb-0 max-w-full sm:max-w-[60%]">
					<h1 className="text-2xl sm:text-3xl font-bold break-words">
						{model?.name}
					</h1>
					{isAuthor && (
						<VisibilityToggle
							isVisible={model?.public}
							onToggle={() => handleVisibilityToggle()}
							className="flex-shrink-0"
						/>
					)}
				</div>
				<div className="flex flex-wrap gap-2 justify-start sm:justify-end">
					{model?.contentURL && (
						<Link
							href={`${model.contentURL}`}
							onClick={(e) => handleDownload(e, model.contentURL, "decl")}
							className="bg-orange hover:bg-indigo hover:text-white text-black font-bold py-2 px-4 rounded inline-block"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								className="w-5 h-5 inline-block mr-2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-5-4l-3 3m0 0l-3-3m3 3V4"
								/>
							</svg>
							Model
						</Link>
					)}
					{model?.automataUrl && (
						<Link
							href={`${model.automataUrl}`}
							onClick={(e) => handleDownload(e, model.automataUrl, "dot")}
							className="bg-orange hover:bg-indigo hover:text-white text-black font-bold py-2 px-4 rounded inline-block"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								className="w-5 h-5 inline-block mr-2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-5-4l-3 3m0 0l-3-3m3 3V4"
								/>
							</svg>
							Automata
						</Link>
					)}
					{isAuthor && (
						<div className="flex space-x-2">
							<button
								onClick={() => router.push(`/repo/models/edit/${params.id}`)}
								className="bg-blue hover:bg-green text-white font-bold py-2 px-4 rounded"
							>
								Edit
							</button>
							<button
								onClick={handleDelete}
								className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
							>
								Delete
							</button>
						</div>
					)}
					<Link
						href="/repo"
						className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
					>
						Back
					</Link>
				</div>
			</div>

			<div className="bg-white shadow-md rounded-lg p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Model Details</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p className="font-semibold">Description:</p>
						<p>{model?.description || "Not specified"}</p>
					</div>
					<div>
						<p className="font-semibold">Author:</p>
						<p>
							{" "}
							{model?.author?.name ? (
								<div className="flex items-center">
									<Link
										href={`mailto:${model.author.email}`}
										className="flex items-center"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 text-gray-400 hover:text-blue-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
										<span className="ml-2">{model.author.name}</span>
									</Link>
								</div>
							) : (
								"Not specified"
							)}
						</p>
					</div>
					<div>
						<p className="font-semibold">Created At:</p>
						<p>{new Date(model?.createdAt).toLocaleString()}</p>
					</div>
					<div>
						<p className="font-semibold">Reference:</p>
						{model?.reference?.url ? (
							<Link
								href={`${model.reference.url}`}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center text-blue hover:text-green hover:underline"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="mr-1 h-4 w-4 text-blue-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4.5C8.32 4.5 5.03 7.12 3.24 10.12c-.08.14-.08.31 0 .45C5.03 16.88 8.32 19.5 12 19.5s6.97-2.62 8.76-5.88c.08-.14.08-.31 0-.45C18.97 7.12 15.68 4.5 12 4.5zM12 15a3 3 0 100-6 3 3 0 000 6z"
									/>
								</svg>{" "}
								{model.reference.name}
							</Link>
						) : (
							<p>No reference provided</p>
						)}
					</div>
					{!isAuthor && (
						<>
							<div>
								<p className="font-semibold">Application Domain:</p>
								<p>
									{applicationDomain === "" ? "Unspecified" : applicationDomain}
								</p>
							</div>
							<div>
								<p className="font-semibold">Purpose:</p>
								<p>{purpose === "" ? "Unspecified" : purpose}</p>
							</div>
						</>
					)}
				</div>
			</div>

			{isAuthor && metrics.length > 1 && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h2 className="text-2xl font-bold mb-6 text-gray-800">
						Model Information
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="purpose"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Purpose:
							</label>
							<div className="flex flex-col space-y-2">
								<div className="flex">
									<select
										id="purpose"
										value={purpose}
										onChange={handlePurposeChange}
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									>
										<option value="" disabled>
											Select a purpose
										</option>
										{allPurposes.map((purpose) => (
											<option key={purpose} value={purpose}>
												{purpose}
											</option>
										))}
										<option value="custom">Other (specify)</option>
									</select>
									<button
										onClick={() => handleSubmit("SO1")}
										className="bg-indigo hover:bg-blue text-white font-bold py-2 px-4 rounded-r-md transition duration-150 ease-in-out"
									>
										Submit
									</button>
								</div>
								{purpose === "custom" && (
									<input
										type="text"
										value={customPurpose}
										onChange={(e) => setCustomPurpose(e.target.value)}
										placeholder="Enter custom purpose"
										className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									/>
								)}
							</div>
						</div>
						<div>
							<label
								htmlFor="applicationDomain"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Application Domain:
							</label>
							<div className="flex flex-col space-y-2">
								<div className="flex">
									<select
										id="applicationDomain"
										value={applicationDomain}
										onChange={handleDomainChange}
										className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									>
										<option value="" disabled>
											Select a domain
										</option>
										{allDomains.map((domain) => (
											<option key={domain} value={domain}>
												{domain}
											</option>
										))}
										<option value="custom">Other (specify)</option>
									</select>
									<button
										onClick={() => handleSubmit("SO2")}
										className="bg-indigo hover:bg-blue text-white font-bold py-2 px-4 rounded-r-md transition duration-150 ease-in-out"
									>
										Submit
									</button>
								</div>
								{applicationDomain === "custom" && (
									<input
										type="text"
										value={customDomain}
										onChange={(e) => setCustomDomain(e.target.value)}
										placeholder="Enter custom domain"
										className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{metrics.length > 2 && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h2 className="text-2xl font-bold mb-6 text-gray-800">
						Model Metrics
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{metrics.map((metric) => {
							if (metric.ID === "SO1" || metric.ID === "SO2") {
								return null;
							}
							if (metric.ID === "BH2") {
								return (
									<div
										key={metric.ID}
										className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 col-span-2"
									>
										<div className="flex items-center justify-between mb-4">
											<h3 className="text-lg font-semibold text-blue">
												{metric.name}
											</h3>
											<span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
												ID: {metric.ID}
											</span>
										</div>
										<div className="space-y-3">
											<div className="flex items-center space-x-4">
												<span className="font-medium">Consistency Status:</span>
												{!metric.calculationResult ? (
													<span className="px-3 py-1 bg-gray text-white rounded-full font-medium">
														N/A
													</span>
												) : metric.calculationResult.message === "Computation timed out ⚠️" ? (
													<span className="px-3 py-1 bg-yellow text-black rounded-full font-medium">
														Computation timed out ⚠️
													</span>
												) : metric.calculationResult.satisfiable ? (
													<span className="px-3 py-1 bg-green text-white rounded-full font-medium">
														Consistent ✓
													</span>
												) : (
													<span className="px-3 py-1 bg-red-500 text-white rounded-full font-medium">
														Inconsistent ✗
													</span>
												)}

											</div>

											<p className="text-gray-700 mt-4">
												<span className="font-medium">Description:</span>
												<span className="ml-2">{metric.description}</span>
											</p>

											<div className="mt-4">
												<p className="font-medium text-gray-700 mb-2">
													Formula:
												</p>
												<div className="bg-white p-3 rounded-md border border-gray-200 overflow-x-auto">
													<BlockMath
														math={metric.formula.replace(/^\$\$|\$\$$/g, "")}
													/>
												</div>
											</div>
										</div>
									</div>
								);
							}
							if (metric.ID === "BH1") {
								return (
									<div
										key={metric.ID}
										className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 col-span-2"
									>
										<div className="flex items-center justify-between mb-4">
											<h3 className="text-lg font-semibold text-blue">
												{metric.name}
											</h3>
											<span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
												ID: {metric.ID}
											</span>
										</div>
										<div className="space-y-3">
											<div className="flex items-center space-x-4">
												<span className="font-medium">Redundancy Status:</span>
												{!metric.calculationResult ? (
													<span className="px-3 py-1 bg-gray text-white rounded-full font-medium">
														N/A
													</span>
												) : metric.calculationResult.message === "Computation timed out ⚠️" ? (
													<span className="px-3 py-1 bg-yellow text-black rounded-full font-medium">
														Computation timed out ⚠️
													</span>
												) : metric.calculationResult.redundantCount > 0 ? (
													<span className="px-3 py-1 bg-yellow text-black rounded-full font-medium">
														{metric.calculationResult.redundantCount} Redundant Constraints ⚠️
													</span>
												) : (
													<span className="px-3 py-1 bg-green text-white rounded-full font-medium">
														No Redundant Constraint(s) ✓
													</span>
												)}
											</div>

											{metric.calculationResult &&
												metric.calculationResult.redundantCount > 0 && (
													<div className="mt-3">
														<span className="font-medium">
															Redundant Constraints:
														</span>
														<div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
															<code className="text-sm text-gray-700 break-all">
																{metric.calculationResult.result}
															</code>
														</div>
													</div>
												)}

											<p className="text-gray-700 mt-4">
												<span className="font-medium">Description:</span>
												<span className="ml-2">{metric.description}</span>
											</p>

											<div className="mt-4">
												<p className="font-medium text-gray-700 mb-2">
													Formula:
												</p>
												<div className="bg-white p-3 rounded-md border border-gray-200 overflow-x-auto">
													<BlockMath
														math={metric.formula.replace(/^\$\$|\$\$$/g, "")}
													/>
												</div>
											</div>
										</div>
									</div>
								);
							}
							return (
								<div
									key={metric.ID}
									className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-blue">
											{metric.name}
										</h3>
										<span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
											ID: {metric.ID}
										</span>
									</div>
									<div className="space-y-3">
										<p className="text-gray-700">
											<span className="font-medium">Result:</span>
											<span className="ml-2 text-green font-semibold">
												{metric.calculationResult}
											</span>
										</p>
										<p className="text-gray-700">
											<span className="font-medium">Description:</span>
											<span className="ml-2">{metric.description}</span>
										</p>
										<div className="mt-4">
											<p className="font-medium text-gray-700 mb-2">Formula:</p>
											<div className="bg-white p-3 rounded-md border border-gray-200 overflow-x-auto">
												{metric.formula ? (
													<BlockMath
														math={metric.formula.replace(/^\$\$|\$\$$/g, "")}
													/>
												) : (
													<span className="text-gray-500">N/A</span>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{textRepContent && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Text Representation</h2>
					<pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
						{textRepContent}
					</pre>
				</div>
			)}

			{model?.imageURL && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Model Image</h2>
					<div className="relative w-full h-64">
						<Image
							src={model.imageURL}
							alt="Model Image"
							layout="fill"
							objectFit="contain"
							className="rounded-lg"
						/>
					</div>
				</div>
			)}

			<DeleteConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={confirmDelete}
			/>
		</div>
	);
};

export default DeclareModel;
