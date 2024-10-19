import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const metricAPI = createApi({
  reducerPath: "metricAPI",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/metrics" }),
  endpoints: (builder) => ({
    getMetricDetails: builder.query({
      query(id) {
        return {
          url: `/${id}`,
        };
      },
    }),
    deleteMetric: builder.mutation({
      query(id) {
        return {
          url: `/${id}`,
          method: "DELETE",
        };
      },
    }),
  }),
});

export const { useGetMetricDetailsQuery } = metricAPI;
