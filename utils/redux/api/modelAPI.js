import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const modelAPI = createApi({
  reducerPath: "modelAPI",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/models" }),
  endpoints: (builder) => ({
    getModelDetails: builder.query({
      query(id ) {
        return {
          url: `/${id}`,
        };
      },
    }),
   
  }),
});

export const { useModelDetailsQuery } = modelAPI;
