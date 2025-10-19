import React from 'react';
import {createBrowserRouter} from 'react-router-dom'

import MainLayout from './layout/mainLayout'
import AuthLayout from './layout/authLayout'
import { LoginPage } from './Pages/Login';
import { RegisterPage } from './Pages/Register';
import ForgetPasswordPage  from './Pages/ForgetPassword';
import Error404Page from './Pages/Error404';
import { ProfilePage } from './Pages/UserPages/Profile';
import AdminDashboardPage from './Pages/AdminPages/AdminDashboard';
import  AddItemCategoryPage  from './Pages/AdminPages/ItemCategory';
import ReportItemPage  from './Pages/UserPages/reportItem';
import CategoryItems from './Pages/CategoryItems';
import ItemPage from './Pages/Item';
import UserListingPage from './Pages/AdminPages/UsersPage/users-listing-page';
import ClaimItemsListingPage from './Pages/AdminPages/ClaimItem/claimItemsPage';
import ClaimPage from './Pages/AdminPages/ClaimPage';
import ItemsListingPage from './Pages/AdminPages/Items/itemsListing';
import StoreLocations from './Pages/StoresPage';
import AddStorePage from './Pages/AdminPages/AddStorePage';
import PersonPage from './Pages/personPage';
import ReportLostPersonPage from './Pages/UserPages/reportLostPerson';
import PeopleListingPage from './Pages/AdminPages/People/peopleListingPage';
import ReportFoundPersonPage from './Pages/AdminPages/reportFoundPerson';
import HomePage from './Pages/Home';
import MenuPage from './Pages/Menu';

export const router = createBrowserRouter([
    {
      path:"*",
      element: <Error404Page />
    },
    {
      path:"/",
      element: <HomePage />
    },
    {
      path: "/menu",
      element: <MainLayout />,
      children:[
        {
            path: "",
            element: <MenuPage />
        },
      ]
    },
    {
      path: "/",
      element: <MainLayout />,
      children:[
        {
            path: "u/profile",
            element: <ProfilePage />
        },
        {
            path: "category/:categoryId",
            element: <CategoryItems />
        },
        {
            path: "item/:itemId",
            element: <ItemPage />
        },
        {
            path: "person/:personId",
            element: <PersonPage />
        },
        {
            path: "report/item",
            element: <ReportItemPage />
        },
        {
            path: "report/person",
            element: <ReportLostPersonPage />
        },
        {
            path: "centres",
            element: <StoreLocations />
        },
      ]
    },
    {
      path: "/accounts/",
      element: <AuthLayout />,
      children:[
        {
            path: "sign-in",
            element: <LoginPage />
        },
        {
            path: "sign-up",
            element: <RegisterPage />
        },
        {
            path: "forget-password",
            element: <ForgetPasswordPage />
        },
      ]
    },
    {
      path:"/dashboard/",
      element: <MainLayout />,
      children:[
        {
          path: "",
          element:<AdminDashboardPage />
        },
        {
          path: "people",
          element:<PeopleListingPage />
        },
        {
          path: "items",
          element:<ItemsListingPage />
        },
        {
          path: "users",
          element:<UserListingPage />
        },
        {
          path: "claims/:id",
          element:<ClaimPage />
        },
        {
          path: "claims",
          element:<ClaimItemsListingPage />
        },
        {
          path: "category/add-new",
          element:<AddItemCategoryPage />
        },
        {
          path: "report/found-person",
          element:<ReportFoundPersonPage />
        },
        {
          path: "store/add-new",
          element:<AddStorePage />
        }
      ]
    },
]);