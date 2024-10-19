"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useRegisterMutation } from "../../utils/redux/api/userAPI";
import { toast } from "react-hot-toast";
import { useLoadingError } from "@/utils/client/context/LoadingErrorContext";

export default function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState("");
  const { setIsError } = useLoadingError();
  const router = useRouter();

  const validateName = (name) => name.length >= 5;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  const [register, { isLoading, error: registerError }] = useRegisterMutation();

  useEffect(() => {
    setIsFormValid(
      validateName(user.name) &&
        validateEmail(user.email) &&
        validatePassword(user.password)
    );
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please ensure all fields are correct");
      return;
    } else {
      setError("");
    }

    const result = await register(user).unwrap();

    if (result.success) {
      router.push("/login");
      toast.success("Account created!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name (at least 5 characters)"
                value={user.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={user.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="text-xs text-gray-600 mt-2">
            Password requirements:
            <ul className="list-disc list-inside mt-1">
              <li>At least 8 characters long</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>

          {(registerError || error) && (
            <div className="text-red-500 text-sm mt-2">
              {error || registerError?.data?.message}
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group cursor-pointer relative w-full flex bg-indigo hover:bg-blue justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
            <Link
              href="/repo"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Repository
            </Link>
          </div>
        </form>
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo hover:text-green"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
