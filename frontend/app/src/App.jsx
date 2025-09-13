import React from 'react'
import './App.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import Home from '../pages/Home'
import LoginPage from './Components/LoginPage'
import SignupPage from './Components/SignupPage'
import MainNavigation from './Components/MainNavigation'
import AddRecipes from '../pages/AddRecipes'
import EditRecipe from '../pages/EditRecipe'
import Favorites from '../pages/Favourites'

import axios from 'axios'



const getAllRecipes=async()=>{
  let allRecipes=[]
  await axios.get('http://localhost:5000/recipe').then(res=>{
    allRecipes=res.data
  })
  return allRecipes
}


const router=createBrowserRouter([
  {path:"/",element:<MainNavigation/>,children:[
    {path:"/",element:<Home/>,loader:getAllRecipes},
    {path:"/login",element:<LoginPage/>},
    {path:"/signup",element:<SignupPage/>},
    {path:"/my-recipes",element:<Home/>},
    {path:"/favorites",element:<Favorites/>,loader:getAllRecipes},
    {path:"/AddRecipes",element:<AddRecipes/>},
    {path:"/edit-recipe",element:<EditRecipe/>},
  ]}
])

export default function App() {
  return (
   <>
   <RouterProvider router={router}/>;
   </>
  )
}