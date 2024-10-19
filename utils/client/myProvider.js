"use client";

import { LoadingErrorProvider } from "./context/loadingErrorContext";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { store } from "../redux/store";

export default function MyProvider({ children }) {
  return (
    <>
      <Toaster />
      <Provider store={store}>
        <SessionProvider>
          <LoadingErrorProvider>{children}</LoadingErrorProvider>
        </SessionProvider>
      </Provider>
    </>
  );
}
