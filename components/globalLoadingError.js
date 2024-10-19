"use client";
import React from "react";
import { useLoadingError } from "@/utils/client/context/loadingErrorContext";
import Loading from "@/components/loading";
import Error from "@/components/error";

const GlobalLoadingError = () => {
  const { loading, error } = useLoadingError();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  return null;
};

export default GlobalLoadingError;
