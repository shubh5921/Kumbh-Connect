import { apiSlice } from "./apiSlice";

const categoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder)=>({
        addItemCategory: builder.mutation({
            query:(data)=>({
                url:'/category/',
                method:'POST',
                body:data,
            }),
            invalidatesTags: ['Categories']
        }),
        getItemCategory: builder.query({
            query: () => 'category',
            providesTags: ['Categories']
        }),    
    }
)})

export const {useAddItemCategoryMutation, useGetItemCategoryQuery} = categoryApiSlice;