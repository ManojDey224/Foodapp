const express = require('express');
const router=express.Router();
const { getRecipes, getRecipe, addRecipe, editRecipe, deleteRecipe, getUserRecipes, saveToMyRecipes, upload } = require('../controller/recipe');
const {UserSignup,Userlogin,getUser}=require("../controller/User")

router.get('/', getRecipes); //Get all recipes
router.get('/:id', getRecipe); //Get a recipe by id
router.post('/',upload.any(),addRecipe); //Create a recipe
router.put('/:id',upload.any(), editRecipe); //Update a recipe
router.delete('/:id', deleteRecipe);
router.get('/user/:id', getUserRecipes);
router.post("/signup",UserSignup)
router.post("/login",Userlogin)
router.get("/User/:id",getUser)
router.post('/save-to-my-recipes/:id', saveToMyRecipes); //Get recipes for a specific user

module.exports = router;