"use client";

import Link from "next/link";
import { toast } from "react-hot-toast";
import { useLoadingError } from "@/utils/client/context/loadingErrorContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CreateDeclareModel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    referenceName: "",
    referenceUrl: "",
    content: null,
    textRep: null,
    image: null,
  });

  const [errors, setErrors] = useState({});
  const { setIsError, setIsLoading } = useLoadingError();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
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
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})(\/[-\w\._~:/?#[\]@!$&'()*+,;=]*)*\/?$/.test(
        formData.referenceUrl
      )
    ) {
      errors.referenceUrl = "Invalid URL format";
    }

    return errors;
  };

  const uploadFileToS3 = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    let fileType = file.type;

    if (!fileType) {
      if (file.name.endsWith(".decl")) {
        fileType = "decl";
      } else {
        fileType = "application/octet-stream";
      }
    }

    const formData = new FormData();
    formData.append("fileName", fileName);
    formData.append("fileType", fileType);

    const res = await fetch(`/api/repo/models/upload-file`, {
      method: "POST",
      body: formData,
    });

    const { signedUrl } = await res.json();

    await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": fileType },
    });

    return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      setIsLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("author", session.user._id);

      if (formData.referenceName && formData.referenceUrl) {
        formDataToSend.append("referenceName", formData.referenceName);
        formDataToSend.append("referenceUrl", formData.referenceUrl);
      }

      try {
        if (formData.content) {
          const contentUrl = await uploadFileToS3(formData.content);
          formDataToSend.append("contentUrl", contentUrl);
        }
        if (formData.textRep) {
          const textRepUrl = await uploadFileToS3(formData.textRep);
          formDataToSend.append("textRepUrl", textRepUrl);
        }
        if (formData.image) {
          const imageUrl = await uploadFileToS3(formData.image);
          formDataToSend.append("imageUrl", imageUrl);
        }

        const response = await fetch(`/api/repo/models`, {
          method: "POST",
          body: formDataToSend,
        });

        if (response.ok) {
          toast.success("Model created successfully!");
          router.push("/repo");
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

  if (status === "unauthenticated") {
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Create New Declare Model
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
                required
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
                required
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
                Reference Name
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
                Reference URL
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

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content (.decl file){" "}
                <span className="text-gray-400">
                  (required for metrics calculation, see{" "}
                  <Link
                    className="text-blue hover:text-indigo"
                    href="https://rulemining.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    RuM
                  </Link>
                  )
                </span>
              </label>
              <input
                type="file"
                name="content"
                id="content"
                accept=".decl"
                onChange={handleFileChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="textRep"
                className="block text-sm font-medium text-gray-700"
              >
                Text Representation (.txt file){" "}
              </label>
              <input
                type="file"
                name="textRep"
                id="textRep"
                accept=".txt"
                onChange={handleFileChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.textRep && (
                <p className="mt-2 text-sm text-red-600">{errors.textRep}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Image{" "}
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.image && (
                <p className="mt-2 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Indicates required field
              </p>
              <div className="flex justify-end space-x-3">
                <Link
                  href="/repo"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || status === "unauthenticated"}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    status === "authenticated"
                      ? "bg-indigo hover:bg-green"
                      : "bg-gray-400 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo`}
                >
                  {isSubmitting ? "Creating..." : "Create Model"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
