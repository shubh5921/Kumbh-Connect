import { apiSlice } from "./apiSlice";

const itemsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        reportItem: builder.mutation({
            query: (data) => ({
                url: '/item/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Items']
        }),
        updateItemStatus: builder.mutation({
            query: ({ _id, returnedTo }) => ({
                url: `item/status/${_id}`,
                method: 'PUT',
                body: {returnedTo}
            }),
            invalidatesTags: ['Items']
        }),
        deleteItem: builder.mutation({
            query: (_id) => ({
                url: `item/${_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Items']
        }),
        getItems: builder.query({
            query: () => 'item',
            providesTags: ['Items']
        }),
        getItemsByCategory: builder.query({
            query: (categoryId) => `item/category/${categoryId}`,
            providesTags: ['Items']
        }),
        getUserItem: builder.query({
            query: () => 'item/user',
            providesTags: ['Items']
        }),
        getItemById: builder.query({
            query: (id) => `/item/id/${id}`,
            providesTags: ['Items']
        }),
    }
    )
})

export const { useReportItemMutation, useUpdateItemStatusMutation, useGetItemsQuery,useGetItemsByCategoryQuery, useGetUserItemQuery, useGetItemByIdQuery, useDeleteItemMutation } = itemsApiSlice;