import { apiSlice } from "./apiSlice";

const personApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        reportLostPerson: builder.mutation({
            query: (data) => ({
                url: '/person/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['People']
        }),
        reportFoundPerson: builder.mutation({
            query: (data) => ({
                url: '/person/found',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['People']
        }),
        updatePersonStatus: builder.mutation({
            query: (data) => ({
                url: `person/status/${data._id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['People']
        }),
        deletePerson: builder.mutation({
            query: (_id) => ({
                url: `person/${_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['People']
        }),
        getPersons: builder.query({
            query: () => 'person',
            providesTags: ['People']
        }),
        getUserPeople: builder.query({
            query: () => 'person/user',
            providesTags: ['People']
        }),
        getPersonById: builder.query({
            query: (id) => `/person/id/${id}`,
            providesTags: ['People']
        }),
    }
    )
})

export const { 
    useReportLostPersonMutation,
    useReportFoundPersonMutation,
    useUpdatePersonStatusMutation,
    useDeletePersonMutation,
    useGetPersonsQuery,
    useGetPersonByIdQuery,
    useGetUserPeopleQuery
 } = personApiSlice;