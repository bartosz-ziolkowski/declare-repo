"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { toast } from "react-hot-toast";
import { useLoadingError } from "@/utils/client/context/LoadingErrorContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditDeclareModel({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    referenceName: "",
    referenceUrl: "",
  });
  const { setIsLoading, setIsError } = useLoadingError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchModel = async () => {
      if (!params.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/repo/models/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        if (session && session.user._id !== data.model.author._id) {
            throw new Error("You can't edit this model");
        }

        setFormData({
          name: data.model.name,
          description: data.model.description,
          referenceName: data.model.reference?.name || "",
          referenceUrl: data.model.reference?.url || "",
        });
      } catch (err) {
        setIsError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchModel();
    } else if (status === "unauthenticated") {
      toast.error("You are not signed in");
      router.push("/login");
    }

   
  }, [params.id, status, session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";

    if (
      (formData.referenceName && !formData.referenceUrl) ||
      (!formData.referenceName && formData.referenceUrl)
    ) {
      errors.reference =
        "Both Reference Name and Reference URL must be provided together";
    }

    if (
      formData.referenceUrl &&
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        formData.referenceUrl
      )
    ) {
      errors.referenceUrl = "Invalid URL format";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      setIsLoading(true);
      try {
        const dataToSend = {
          name: formData.name,
          description: formData.description,
        };

        if (formData.referenceName && formData.referenceUrl) {
          dataToSend.reference = {
            name: formData.referenceName,
            url: formData.referenceUrl,
          };
        }

        const response = await fetch(`/api/repo/models/${params.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
          toast.success("Model updated successfully!");
          router.push(`/repo/models/${params.id}`);
        } else {
          const data = await response.json();
          toast.error(data.message);
        }
      } catch (error) {
        setIsError(error);
      } finally {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Edit Declare Model
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="referenceName"
                className="block text-sm font-medium text-gray-700"
              >
                Reference Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                name="referenceName"
                id="referenceName"
                value={formData.referenceName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="referenceUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Reference URL <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                name="referenceUrl"
                id="referenceUrl"
                value={formData.referenceUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.referenceUrl && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.referenceUrl}
                </p>
              )}
            </div>

            {errors.reference && (
              <p className="mt-2 text-sm text-red-600">{errors.reference}</p>
            )}

            <div className="flex justify-end">
              <Link
                href={`/repo/models/${params.id}`}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || status === "unauthenticated"}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? "Updating..." : "Update Model"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
