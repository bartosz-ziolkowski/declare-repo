"use client";

import "swagger-ui-react/swagger-ui.css";

import { signOut, useSession } from "next-auth/react";
import SwaggerUI from "swagger-ui-react";
import apiConfig from "../../swagger";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function ApiDocs() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-8">
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-gray-700 font-semibold">
                  Welcome, {session.user?.name?.split(" ")[0] || "User"}!
                </span>
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
              <Link
								href="/login"
								className="bg-green hover:bg-blue text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
							>
								Sign In
							</Link>
            )}
           <button
								onClick={() => router.push("/")}
								className="bg-orange hover:bg-indigo text-black hover:text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
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
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              Back
            </button>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <SwaggerUI spec={apiConfig} />
        </div>
      </div>
    </div>
  );
}
