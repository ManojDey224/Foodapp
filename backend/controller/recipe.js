const Recipe = require('../models/recipe');
const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Public/images')
    },
    filename: function (req, file, cb) {
      const filename = Date.now() + '-' + file.originalname
      cb(null, filename  )
    }
  })
  
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  })

const getRecipes = async (req, res) => {
    try {
        console.log('=== GET RECIPES REQUEST ===');
        const recipes = await Recipe.find();
        console.log('Found recipes:', recipes.length);
        console.log('Recipes data:', recipes);
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
}


const getRecipe = async (req, res) => {
    const recipes = await Recipe.find();
    res.json(recipes);
}
const getUserRecipes = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user and get their saved recipes
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Get the user's saved recipes
        const savedRecipeIds = user.savedRecipes || [];
        const userRecipes = await Recipe.find({ '_id': { $in: savedRecipeIds } });

        if (userRecipes.length === 0) {
            return res.status(200).json({
                message: `No saved recipes found for user`,
                data: []
            });
        }

        res.status(200).json({
            message: `Successfully retrieved saved recipes`,
            data: userRecipes
        });

    } catch (error) {
        console.error('Error in getUserRecipes:', error);
        res.status(500).json({
            message: 'Server error while fetching recipes'
        });
    }
};
const addRecipe = async (req, res) => {
    try {
        console.log('=== ADD RECIPE REQUEST STARTED ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);
        
        const { title, ingredients, instructions, time } = req.body;
        
        // Parse ingredients if it's a JSON string (from FormData)
        let parsedIngredients = ingredients;
        if (typeof ingredients === 'string') {
            try {
                parsedIngredients = JSON.parse(ingredients);
                console.log('Parsed ingredients from JSON:', parsedIngredients);
            } catch (error) {
                console.log('Ingredients parsing error:', error);
                parsedIngredients = ingredients.split(',').map(item => item.trim());
                console.log('Fallback parsed ingredients:', parsedIngredients);
            }
        }
        
        // Parse instructions - convert string to array if needed
        let parsedInstructions = instructions;
        if (typeof instructions === 'string') {
            // Split by newlines or periods to create instruction steps
            parsedInstructions = instructions.split(/\n|\./).map(step => step.trim()).filter(step => step.length > 0);
            console.log('Parsed instructions:', parsedInstructions);
        }
        
        console.log('Final parsed data:', {
            title,
            parsedIngredients,
            parsedInstructions,
            time
        });
        
        // Validate required fields
        if(!title || !parsedIngredients || !parsedInstructions || parsedInstructions.length === 0) {
            console.log('Validation failed:', { title, parsedIngredients, parsedInstructions });
            return res.status(400).json({message: 'Required fields cannot be empty'});
        }
        
               // Handle file upload if present
               let imagePath = null;
               if (req.files && req.files.length > 0) {
                   imagePath = req.files[0].filename; // Get filename from first uploaded file
                   console.log('File uploaded to:', imagePath);
                   console.log('All uploaded files:', req.files.map(f => f.filename));
               } else {
                   console.log('No file uploaded');
               }
        
        console.log('Creating recipe with data:', {
            title, 
            ingredients: parsedIngredients,
            instructions: parsedInstructions,
            time,
            coverImage: imagePath
        });
        
        const newRecipe = await Recipe.create({ 
            title, 
            ingredients: parsedIngredients,
            instructions: parsedInstructions,
            time,
            coverImage: imagePath // Save image path if file was uploaded
        });
        
        console.log('Recipe created successfully:', newRecipe);
        console.log('=== ADD RECIPE REQUEST COMPLETED ===');
        res.status(201).json(newRecipe);
    } catch (error) {
        console.error('=== ADD RECIPE ERROR ===');
        console.error('Error creating recipe:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        // More specific error handling
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({ 
                error: 'Validation Error', 
                details: Object.values(error.errors).map(err => err.message).join(', ')
            });
        } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            console.error('MongoDB error:', error);
            return res.status(500).json({ 
                error: 'Database Error', 
                details: 'Failed to save recipe to database'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to create recipe', 
            details: error.message 
        });
    }
}

const editRecipe = async (req, res) => {
    try {
        console.log('=== EDIT RECIPE REQUEST ===');
        console.log('Recipe ID:', req.params.id);
        console.log('Request body:', req.body);
        
        const { title, ingredients, instructions, time } = req.body;
        
        // Parse ingredients if it's a JSON string (from FormData)
        let parsedIngredients = ingredients;
        if (typeof ingredients === 'string') {
            try {
                parsedIngredients = JSON.parse(ingredients);
            } catch (error) {
                parsedIngredients = ingredients.split(',').map(item => item.trim());
            }
        }
        
        // Parse instructions - convert string to array if needed
        let parsedInstructions = instructions;
        if (typeof instructions === 'string') {
            parsedInstructions = instructions.split(/\n|\./).map(step => step.trim()).filter(step => step.length > 0);
        }
        
        // Handle file upload if present
        let imagePath = null;
        if (req.files && req.files.length > 0) {
            imagePath = req.files[0].filename;
            console.log('New image uploaded:', imagePath);
        }
        
        const updateData = {
            title,
            ingredients: parsedIngredients,
            instructions: parsedInstructions,
            time
        };
        
        // Only update coverImage if a new file was uploaded
        if (imagePath) {
            updateData.coverImage = imagePath;
        }
        
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id, 
            updateData,
            { new: true }
        );
        
        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        console.log('Recipe updated successfully:', updatedRecipe);
        res.json(updatedRecipe);
        
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ 
            error: 'Failed to update recipe', 
            details: error.message 
        });
    }
}

const deleteRecipe = async (req, res) => {
    try {
        console.log('=== DELETE RECIPE REQUEST ===');
        console.log('Recipe ID to delete:', req.params.id);
        
        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
        
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        console.log('Recipe deleted successfully:', deletedRecipe);
        res.json({ 
            message: 'Recipe deleted successfully', 
            deletedRecipe: deletedRecipe 
        });
        
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ 
            error: 'Failed to delete recipe', 
            details: error.message 
        });
    }
}

// Add this controller function to save a recipe to a user's myRecipes
const saveToMyRecipes = async (req, res) => {
    try {
      const userId = req.params.id;
      const { recipeId } = req.body;
  
      if (!recipeId) {
        return res.status(400).json({ message: 'recipeId is required in request body' });
      }

 // Optional: verify token to ensure the calling user is authorized
 const authHeader = req.headers.authorization || '';
 const token = authHeader.split(' ')[1];
 if (!token) {
   return res.status(401).json({ message: 'Missing authorization token' });
 }
 try {
   jwt.verify(token, process.env.SECRET_KEY);
 } catch (err) {
   return res.status(401).json({ message: 'Invalid or expired token' });
 }

 const user = await User.findById(userId);
 if (!user) {
   return res.status(404).json({ message: 'User not found' });
 }

 // Ensure myRecipes is an array
 if (!Array.isArray(user.myRecipes)) {
   user.myRecipes = [];
 }

 // Prevent duplicates
 if (user.myRecipes.includes(recipeId)) {
   return res.status(409).json({ message: 'Recipe already saved to myRecipes' });
 }

 user.myRecipes.push(recipeId);
 await user.save();

 return res.status(200).json({
   message: 'Recipe saved to myRecipes successfully',
   myRecipes: user.myRecipes
 });
} catch (error) {
 console.error('saveToMyRecipes error:', error);
 return res.status(500).json({ message: 'Server error while saving recipe' });
}
};

module.exports = {
    getRecipes,
    getRecipe,
    addRecipe,
    editRecipe,
    deleteRecipe,
    getUserRecipes,
    saveToMyRecipes,
    upload
}
