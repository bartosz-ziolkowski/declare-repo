"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import FormulaModal from "./_components/formulaModal";
import Link from "next/link";
import { MyPagination } from "./_components/myPagination";
import { useLoadingError } from "@/utils/client/context/loadingErrorContext";

const fetchData = async (type, queryParams) => {
	const res = await fetch(`/api/repo/${type}?${queryParams}`);
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message);
	}

	return data;
};

function formatDate(dateString) {
	if (!dateString) return null;

	const date = new Date(dateString);
	if (isNaN(date)) return null;

	return date.toISOString().split("T")[0];
}

export default function Repo() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [displayType, setDisplayType] = useState("all");
	const [data, setData] = useState(null);
	const { setIsLoading, setIsError } = useLoadingError();
	const [currentPage, setCurrentPage] = useState(
		Number.parseInt(searchParams.get("page") || "1", 6),
	);
	const { data: session } = useSession();
	const [resPerPage, setResPerPage] = useState(6);
	const [totalItems, setTotalItems] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentFormula, setCurrentFormula] = useState("");
	const [allMetrics, setAllMetrics] = useState([]);
	const [currentMetricName, setCurrentMetricName] = useState("");
	const [currentMetricId, setCurrentMetricId] = useState("");

	const [filters, setFilters] = useState({
		name: "",
		author: "",
		createdAtStart: "",
		createdAtEnd: "",
		sort: "",

		numberOfConstraints: "",
		purpose: "",
		applicationDomain: "",
		separability: "",
		density: "",
	});
	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => {
			const newFilters = { ...prev, [name]: value };
			if (
				(name === "createdAtStart" || name === "createdAtEnd") &&
				value === ""
			) {
				delete newFilters[name];
			}
			return newFilters;
		});
	};

	const openModal = (id, formula, name) => {
		setCurrentFormula(formula);
		setCurrentMetricId(id);
		setCurrentMetricName(name);
		setIsModalOpen(true);
	};

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const queryParams = new URLSearchParams({
				page: currentPage,
				...Object.entries(filters).reduce((acc, [key, value]) => {
					if (value !== "") {
						acc[key] = value;
					}
					return acc;
				}, {}),
			});

			const result = await fetchData(displayType, queryParams);

			if (displayType === "models") {
				setData(result.models);
			} else if (displayType === "metrics") {
				setData(result.metrics);
			} else if (displayType === "all") {
				setData(result.modelsWithMetrics);
				const allMetrics = getObjectWithMostMetrics(result.modelsWithMetrics);
				setAllMetrics(allMetrics);
			}

			setTotalItems(result.filteredCount);
			setResPerPage(result.resPerPage);
			setIsError(null);
		} catch (err) {
			setIsError(err);
			setData(null);
		} finally {
			setIsLoading(false);
		}
	}, [displayType, currentPage, filters]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const toggleDisplayType = (newType) => {
		setDisplayType(newType);
		setCurrentPage(1);

		if (["models", "metrics"].includes(newType)) {
			setFilters({
				name: "",
				author: "",
				createdAtStart: "",
				createdAtEnd: "",
				sort: "",
			});
		}
	};

	const getObjectWithMostMetrics = (data) => {
		if (!data || data.length === 0) return [];

		const objectWithMostMetrics = data.reduce(
			(max, current) =>
				current.metrics?.length > (max.metrics?.length || 0) ? current : max,
			data[0],
		);

		return (
			objectWithMostMetrics.metrics?.sort((a, b) => {
				if (a.metricID < b.metricID) return -1;
				if (a.metricID > b.metricID) return 1;
				return 0;
			}) || []
		);
	};

	const handlePageChange = (page) => {
		setCurrentPage(page);
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", page.toString());
		router.push(`/repo?${params.toString()}`);
	};

	return (
		<div className="flex flex-col items-center gap-10">
			<div className="w-full flex justify-between items-center px-4 py-4 bg-white shadow-md rounded-lg">
				<div className="flex space-x-2">
					<button
						onClick={() => toggleDisplayType("all")}
						className={`${
							displayType === "all"
								? "bg-orange text-black"
								: "bg-blue hover:bg-indigo text-white"
						}  font-bold py-2 px-4 rounded transition duration-300 ease-in-out`}
					>
						All
					</button>
					<button
						onClick={() => toggleDisplayType("models")}
						className={`${
							displayType === "models"
								? "bg-orange text-black"
								: "bg-blue hover:bg-indigo text-white"
						}  font-bold py-2 px-4 rounded transition duration-300 ease-in-out`}
					>
						Models
					</button>
					<button
						onClick={() => toggleDisplayType("metrics")}
						className={`${
							displayType === "metrics"
								? "bg-orange text-black"
								: "bg-blue hover:bg-indigo text-white"
						}  font-bold py-2 px-4 rounded transition duration-300 ease-in-out`}
					>
						Metrics
					</button>
				</div>

				<div className="flex items-center space-x-4">
					{session ? (
						<>
							<span className="text-gray-700 font-semibold">
								Welcome, {session.user.name.split(" ")[0]}
							</span>
							<button
								onClick={() => router.push("/")}
								className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="w-5 h-5 mr-2"
								>
									<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
									<polyline points="9 22 9 12 15 12 15 22"></polyline>
								</svg>
								Home
							</button>
							<button
								onClick={() => router.push("/repo/info")}
								className="bg-blue hover:bg-indigo text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
							>
								Info
							</button>
							<Link
								href={
									displayType === "metrics"
										? "/repo/metrics/new"
										: "/repo/models/new"
								}
								className="bg-green hover:bg-blue text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Add {displayType === "metrics" ? "Metric" : "Model"}
							</Link>
							<button
								onClick={() => signOut()}
								className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 16l4-4m0 0l-4-4m4 4H3"
									/>
								</svg>
								Log out
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => router.push("/")}
								className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="w-5 h-5 mr-2"
								>
									<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
									<polyline points="9 22 9 12 15 12 15 22"></polyline>
								</svg>
								Home
							</button>
							<button
								onClick={() => router.push("/repo/info")}
								className="bg-blue hover:bg-indigo text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
							>
								Info
							</button>
							<Link
								href="/login"
								className="bg-green hover:bg-blue text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
							>
								Sign In
							</Link>
						</>
					)}
				</div>
			</div>
			<h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue to-indigo animate-pulse">
				{displayType === "models"
					? "Declare Models"
					: displayType === "metrics"
						? "Metrics"
						: "Repository"}
			</h2>
			<div className="w-full max-w-4xl mx-auto mb-8">
				<div className="bg-white shadow-md rounded-lg overflow-hidden">
					<div className="p-4">
						{displayType === "all" ? (
							<div className="flex flex-col space-y-4">
								<div className="flex justify-center space-x-4">
									<div className="w-1/3">
										<label
											htmlFor="constraintVariability"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Constraint Variability
										</label>
										<select
											id="constraintVariability"
											name="constraintVariability"
											value={filters.constraintVariability}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										>
											<option value="">All</option>
											<option value="low">Low (0-0.33)</option>
											<option value="medium">Medium (0.34-0.66)</option>
											<option value="high">High (&gt;0.66)</option>
										</select>
									</div>
									<div className="w-1/3">
										<label
											htmlFor="separability"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Separability
										</label>
										<select
											id="separability"
											name="separability"
											value={filters.separability}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										>
											<option value="">All</option>
											<option value="low">Low (0-0.33)</option>
											<option value="medium">Medium (0.34-0.66)</option>
											<option value="high">High (0.67-1)</option>
										</select>
									</div>
									<div className="w-1/3">
										<label
											htmlFor="density"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Density
										</label>
										<select
											id="density"
											name="density"
											value={filters.density}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										>
											<option value="">All</option>
											<option value="low">Low (0-0.5)</option>
											<option value="medium">Medium (0.5-1.5)</option>
											<option value="high">High (&gt;1.5)</option>
										</select>
									</div>
								</div>
								<div className="flex justify-center space-x-4">
									<div className="w-1/3">
										<label
											htmlFor="purpose"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Purpose
										</label>
										<select
											id="purpose"
											name="purpose"
											value={filters.purpose}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										>
											<option value="">All</option>
											<option value="analysis">Analysis</option>
											<option value="verification">Verification</option>
											<option value="monitoring">Monitoring</option>
										</select>
									</div>
									<div className="w-1/3">
										<label
											htmlFor="applicationDomain"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Application Domain
										</label>
										<select
											id="applicationDomain"
											name="applicationDomain"
											value={filters.applicationDomain}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										>
											<option value="">All</option>
											<option value="healthcare">Healthcare</option>
											<option value="finance">Finance</option>
											<option value="manufacturing">Manufacturing</option>
											<option value="education">Education</option>
											<option value="other">Other</option>
										</select>
									</div>
									<div className="w-1/3">
										<label
											htmlFor="sort"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Sort by
										</label>
										<select
											id="sort"
											name="sort"
											value={filters.sort}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										>
											<option value="">No sorting</option>
											<option value="constraints_asc">
												Constraints (Low to High)
											</option>
											<option value="constraints_desc">
												Constraints (High to Low)
											</option>
											<option value="separability_asc">
												Separability (Low to High)
											</option>
											<option value="separability_desc">
												Separability (High to Low)
											</option>
										</select>
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-col space-y-4">
								<div className="flex justify-center space-x-4">
									<div className="w-1/3">
										<label
											htmlFor="sort"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Sort by Created At
										</label>
										<select
											id="sort"
											name="sort"
											value={filters.sort}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										>
											<option value="">No sorting</option>
											<option value="createdAt_asc">Oldest first</option>
											<option value="createdAt_desc">Newest first</option>
										</select>
									</div>

									<div className="w-1/3">
										<label
											htmlFor="createdAtStart"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Created From
										</label>
										<input
											type="date"
											id="createdAtStart"
											name="createdAtStart"
											value={filters.createdAtStart}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										/>
									</div>

									<div className="w-1/3">
										<label
											htmlFor="createdAtEnd"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Created To
										</label>
										<input
											type="date"
											id="createdAtEnd"
											name="createdAtEnd"
											value={filters.createdAtEnd}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										/>
									</div>
								</div>

								<div className="flex justify-center space-x-4">
									<div className="w-1/3">
										<label
											htmlFor="author"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Author
										</label>
										<input
											type="text"
											id="author"
											name="author"
											value={filters.author}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
											placeholder="Filter by author"
										/>
									</div>

									<div className="w-1/3">
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Name
										</label>
										<input
											type="text"
											id="name"
											name="name"
											value={filters.name}
											onChange={handleFilterChange}
											className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
											placeholder="Filter by name"
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="overflow-x-scroll w-full">
				<div className="p-1.5 w-full inline-block align-middle">
					<div className="overflow-hidden border rounded-lg">
						<table className="min-w-full divide-y divide-gray-200 bg-white">
							<thead className="bg-gray-50">
								<tr>
									{displayType === "all" ? (
										<>
											<th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
												Model Name
											</th>
											{allMetrics.map((metric) => (
												<th
													key={metric.metricID}
													className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase"
												>
													<button
														onClick={() =>
															openModal(
																metric.metricId,
																metric.formula,
																metric.metricName,
															)
														}
														className="text-blue hover:text-indigo"
													>
														{metric.metricID}
													</button>
												</th>
											))}
										</>
									) : displayType === "models" ? (
										<>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Name
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words w-1/5"
											>
												Description
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Reference
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Author
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Created At
											</th>
										</>
									) : (
										<>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												ID
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Name
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Description
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase"
											>
												Formula
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Reference
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Author
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase break-words"
											>
												Created At
											</th>
										</>
									)}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{data && data.length > 0 ? (
									data.map((item, index) => (
										<tr key={index}>
											{displayType === "all" ? (
												<>
													<td
														key={item._id}
														className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"
													>
														{" "}
														<Link
															href={`/repo/models/${item._id}`}
															className="text-blue hover:text-indigo"
														>
															{item.modelName}
														</Link>
													</td>
													{item.metrics && allMetrics.length > 0 ? (
														allMetrics.map((headerMetric) => {
															const metric = item.metrics.find(
																(m) => m.metricID === headerMetric.metricID,
															);

															return (
																<td
																	key={`${item._id}-${headerMetric.metricID}`}
																	className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"
																>
																	{!metric || metric.calculationResult === ""
																		? "N/A"
																		: headerMetric.metricID === "BH2"
																			? metric.calculationResult.satisfiable
																				? "🟢"
																				: "🔴"
																			: headerMetric.metricID === "BH1"
																				? metric.calculationResult
																						.redundantCount || "0"
																				: metric.calculationResult}
																</td>
															);
														})
													) : (
														<td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
															No records available
														</td>
													)}
												</>
											) : displayType === "models" ? (
												<>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap break-words">
														<div className="flex items-center">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="mr-2 h-4 w-4 text-blue-500"
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
															{"  "}
															<Link
																href={`/repo/models/${item._id}`}
																className=" text-blue hover:text-green"
															>
																{item.name}
															</Link>
														</div>
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-normal break-words w-1/5">
														{" "}
														{item.description}
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-normal break-words">
														{item.reference?.url ? (
															<div className="flex items-center">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="h-5 w-5 mr-2 text-gray-400"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																	/>
																</svg>
																<Link
																	href={`${item.reference.url}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-blue hover:text-green mr-2"
																>
																	{item.reference.name || "N/A"}
																</Link>
															</div>
														) : (
															"N/A"
														)}
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap ">
														{item.author?.name ? (
															<div className="flex items-center">
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

																<Link
																	href={`mailto:${item.author.email}`}
																	className="hover:text-blue"
																>
																	<span className="ml-2">
																		{item.author.name}
																	</span>
																</Link>
															</div>
														) : (
															item.author || "N/A"
														)}
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap break-words">
														{formatDate(item.createdAt)}
													</td>
												</>
											) : (
												<>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap break-words">
														<div className="flex items-center">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="mr-2 h-4 w-4 text-blue-500"
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
															{"  "}
															<Link
																href={`/repo/metrics/${item._id}`}
																className=" text-blue hover:text-green"
															>
																{item.ID}
															</Link>
														</div>
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-normal break-words">
														{item.name}
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-normal break-words w-1/5">
														{item.description}
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-normal break-words">
														<button
															onClick={() =>
																openModal(item._id, item.formula, item.name)
															}
															className="text-white bg-indigo hover:text-black hover:bg-orange font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
														>
															Open
														</button>
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-normal break-words">
														{item.reference?.url ? (
															<div className="flex items-center">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="h-5 w-5 text-gray-400"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																	/>
																</svg>
																<Link
																	href={`${item.reference.url}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-blue hover:text-green ml-2"
																>
																	{item.reference.name || "N/A"}
																</Link>
															</div>
														) : (
															"N/A"
														)}
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap break-words">
														{item.author?.name ? (
															<div className="flex items-center">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="h-5 w-5 mr-2 text-gray-400 hover:text-blue-500"
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
																<Link
																	href={`mailto:${item.author.email}`}
																	className="hover:text-blue"
																>
																	{item.author.name}{" "}
																</Link>
															</div>
														) : (
															"N/A"
														)}
													</td>
													<td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap break-words">
														{formatDate(item.createdAt)}
													</td>
												</>
											)}
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan={displayType === "models" ? 5 : 7}
											className="px-6 py-4 text-sm text-gray-800 text-center"
										>
											{displayType === "models"
												? "No records found"
												: "No records found"}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<MyPagination
				resPerPage={resPerPage}
				totalItemsCount={totalItems}
				setCurrentPage={handlePageChange}
			/>
			<FormulaModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				id={currentMetricId}
				formula={currentFormula}
				title={currentMetricName}
			/>
		</div>
	);
}
