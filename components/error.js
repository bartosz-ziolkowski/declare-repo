"use client";

import { useRouter } from "next/navigation";
import { useLoadingError } from "@/utils/client/context/LoadingErrorContext";

export default function Error({ error }) {
  const router = useRouter();
  const { setIsError } = useLoadingError();

  const handleGoBack = () => {
    router.back();
    setIsError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center h-screen bg-[#d4d2ff]">
      <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full text-center">
        <svg
          className="w-24 h-24 mx-auto mb-4 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-center text-gray-600 mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          type="button"
          onClick={handleGoBack}
          className="bg-blue hover:bg-green text-white font-bold py-2 px-4 rounded w-full mt-4"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
