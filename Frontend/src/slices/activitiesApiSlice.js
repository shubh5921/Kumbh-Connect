import { apiSlice } from "./apiSlice";

const activitiesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder)=>({
        getRecentActivities: builder.query({
            query: () => `activities`,
            providesTags: ['Activities']
        }),
    })
});

export const {useGetRecentActivitiesQuery} = activitiesApiSlice