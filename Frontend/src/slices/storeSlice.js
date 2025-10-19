import { apiSlice } from "./apiSlice";

const categoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder)=>({
        addStore: builder.mutation({
            query:(data)=>({
                url:'/store/',
                method:'POST',
                body:data,
            }),
            invalidatesTags: ['Store']
        }),
        getStores: builder.query({
            query: () => 'store',
            providesTags: ['Store']
        }),    
    }
)})

export const {useAddStoreMutation, useGetStoresQuery} = categoryApiSlice;