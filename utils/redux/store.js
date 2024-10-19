import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "./api/userAPI";
import userReducer from "./features/userSlice";
import { modelAPI } from "./api/modelAPI";
import { metricAPI } from "./api/metricAPI";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [modelAPI.reducerPath]: modelAPI.reducer,
    [metricAPI.reducerPath]: metricAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([userAPI.middleware, modelAPI.middleware, metricAPI.middleware]),
});
