"use client";

import "katex/dist/katex.min.css";

import { BlockMath, InlineMath } from "react-katex";
import { useEffect, useState } from "react";

import DeleteConfirmationModal from "@/components/deleteModal";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useLoadingError } from "@/utils/client/context/loadingErrorContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function Metric({ params }) {
	const router = useRouter();
	const { data: session, status: sessionStatus } = useSession();
	const [metric, setMetric] = useState(null);
	const { setIsLoading, setIsError } = useLoadingError();
	const [isAuthor, setIsAuthor] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [userRole, setUserRole] = useState("user");

	const handleVisibilityToggle = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/repo/metrics/${params.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: metric?.name,
					description: metric?.description,
					reference: metric?.reference,
					formula: metric?.formula,
					public: !isVisible,
				}),
			});

			if (response.ok) {
				if (!isVisible) {
					toast.success("Metric is now visible to the public");
				} else {
					toast("Metric is now hidden from the public");
				}
				setIsVisible(!isVisible);
			} else {
				const data = await response.json();
				toast.error(data.message || "Failed to update visibility");
			}
		} catch (error) {
			setIsError(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const fetchMetric = async () => {
			if (!params.id) return;

			setIsLoading(true);
			try {
				const response = await fetch(`/api/repo/metrics/${params.id}`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message);
				}

				setMetric(data.metric);
				setIsVisible(data.metric.public);
			} catch (err) {
				setIsError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMetric();
	}, [params.id, setIsLoading, setIsError]);

	useEffect(() => {
		if (sessionStatus === "authenticated" && metric && metric.author) {
			setIsAuthor(session.user._id === metric.author._id);
			setUserRole(session.user.role);
			if (userRole === "moderator" || userRole === "admin") {
				setIsAuthor(true);
			}
		}
	}, [sessionStatus, session, metric, userRole]);

	const handleDelete = () => {
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		setShowDeleteModal(false);
		setIsLoading(true);
		try {
			const response = await fetch(`/api/repo/metrics/${params.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Metric deleted successfully!");
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
						{metric?.name}
					</h1>
					{isAuthor && (
						<VisibilityToggle
							isVisible={isVisible}
							onToggle={handleVisibilityToggle}
							className="flex-shrink-0"
						/>
					)}
				</div>
				<div className="flex flex-wrap gap-2 justify-start sm:justify-end">
					{isAuthor && (
						<div className="flex space-x-2">
							<button
								onClick={() => router.push(`/repo/metrics/edit/${params.id}`)}
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
				<h2 className="text-xl font-semibold mb-4">Metric Details</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="mr-11">
						<p className="font-semibold">Description:</p>
						<p>{metric?.description || "N/A"}</p>
					</div>
					<div>
						<p className="font-semibold">Reference:</p>
						{metric?.reference ? (
							<Link
								href={`${metric?.reference.url}`}
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
								{metric?.reference.name}
							</Link>
						) : (
							<p>No reference provided</p>
						)}
					</div>
					<div>
						<p className="font-semibold">Author:</p>
						{metric?.author?.name ? (
							<div className="flex items-center">
								<Link
									href={`mailto:${metric.author.email}`}
									className="flex items-center hover:text-blue"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-2 text-gray-400 "
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
									<span>{metric.author.name}</span>
								</Link>
							</div>
						) : (
							"Not specified"
						)}
					</div>
					<div>
						<p className="font-semibold">Created At:</p>
						<p>{new Date(metric?.createdAt).toLocaleString()}</p>
					</div>
					<div className="md:col-span-2">
						<p className="font-semibold">How to compute:</p>
						<p className="overflow-x-auto whitespace-normal h-auto">
							{metric?.formula ? (
								<span className="katex-wrapper block">
									<InlineMath
										math={metric?.formula}
										style={{
											whiteSpace: "normal",
											wordWrap: "break-word",
											overflow: "hidden",
										}}
									/>
								</span>
							) : (
								"Not specified"
							)}
						</p>
					</div>
				</div>
			</div>

			{metric?.parameters && (
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Parameters</h2>
					<ul className="list-disc pl-5">
						{metric?.parameters.map((parameter, index) => (
							<li key={index} className="mb-2">
								{parameter}
							</li>
						))}
					</ul>
				</div>
			)}

			<DeleteConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={confirmDelete}
			/>
		</div>
	);
}

export default Metric;
