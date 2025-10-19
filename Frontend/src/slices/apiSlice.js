import {fetchBaseQuery, createApi} from '@reduxjs/toolkit/query/react'
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

const baseQuery = fetchBaseQuery({
    baseUrl: `${SERVER_URL}/api/`,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      }
});

export const apiSlice = createApi({
    baseQuery: baseQuery,
    tagTypes:['User'],
    endpoints: () =>({}),
})