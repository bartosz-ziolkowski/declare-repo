"use client";

import React, { createContext, useContext, useState } from "react";

const LoadingErrorContext = createContext();

function useLoadingError() {
  return useContext(LoadingErrorContext);
}

const LoadingErrorProvider = ({ children }) => {
  const [loading, setIsLoading] = useState(false);
  const [error, setIsError] = useState(null);

  return (
    <LoadingErrorContext.Provider
      value={{
        loading,
        setIsLoading,
        error,
        setIsError,
      }}
    >
      {children}
    </LoadingErrorContext.Provider>
  );
};

export { LoadingErrorProvider, useLoadingError };
