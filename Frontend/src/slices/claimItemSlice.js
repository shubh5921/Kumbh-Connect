import { apiSlice } from "./apiSlice";

const claimItemApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        claimItem: builder.mutation({
            query: (data) => ({
                url: '/claim',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Claims']
        }),
        updateClaim: builder.mutation({
            query: (data) => ({
                url: `claim/verify`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Claims']
        }),
        getClaimDetails: builder.query({
            query: (id) => `claim/${id}`,
            providesTags: ['Claims']
        }),
    }
    )
})

export const { useClaimItemMutation, useUpdateClaimMutation, useGetClaimDetailsQuery } = claimItemApiSlice;