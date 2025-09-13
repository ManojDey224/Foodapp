const express = require('express');
const { getRecipes, getRecipe, addRecipe, editRecipe, deleteRecipe, getUserRecipes, upload } = require('../controller/recipe');
const router =express.Router();

router.get('/', getRecipes); //Get all recipes
router.get('/:id', getRecipe); //Get a recipe by id
router.get('/user/:id', getUserRecipes); //Get recipes for a specific user
router.post('/',upload.any(),addRecipe); //Create a recipe
router.put('/:id',upload.any(), editRecipe); //Update a recipe
router.delete('/:id', deleteRecipe); //Delete a recipe

module.exports = router;