import { apiSlice } from "./apiSlice";

const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder)=>({
        getProfile: builder.query({
            query: () => 'user',
            providesTags: ['User']
        }),
        getUsers: builder.query({
            query: () => 'user/all',
            providesTags: ['User']
        }),
        updateProfile : builder.mutation({
            query: (data)=>({
                url: "/user/",
                method:"PUT",
                body: data,
            }),
            invalidatesTags: ['User']
        }),
    })
});

export const {useGetProfileQuery, useGetUsersQuery,  useUpdateProfileMutation} = userApiSlice;