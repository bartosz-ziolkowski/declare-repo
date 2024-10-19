"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "../redux/store";
import { SessionProvider } from "next-auth/react";
import { LoadingErrorProvider } from "./context/LoadingErrorContext";

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
