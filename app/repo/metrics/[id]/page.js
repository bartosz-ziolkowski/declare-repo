"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useLoadingError } from "@/utils/client/context/LoadingErrorContext";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "react-hot-toast";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

function Metric({ params }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [metric, setMetric] = useState(null);
  const { setIsLoading, setIsError } = useLoadingError();
  const [isAuthor, setIsAuthor] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    }
  }, [sessionStatus, session, metric]);

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

  return (
    <div className="w-full px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0 break-words max-w-full sm:max-w-[60%]">
          {metric?.name}
        </h1>
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
            <p>{metric?.description || "Not specified"}</p>
          </div>
          <div>
            <p className="font-semibold">Formula:</p>
            <p className="whitespace-normal">
              {metric?.formula ? <BlockMath
                math={
                  metric?.formula.replace(/^\$\$|\$\$$/g, "") 
                }
              /> : "Not specified"}
              
            </p>
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
