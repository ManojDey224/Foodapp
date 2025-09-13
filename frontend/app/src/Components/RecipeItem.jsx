import React, { useState, useEffect } from "react";
import Foodimg from '../assets/FoodRecipe.png';
import { BsStopwatchFill } from "react-icons/bs";
import { FaHeart, FaEdit, FaTrash } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function RecipeItems({ recipes, onRecipeDeleted, onFavoritesChange }) {
  const navigate = useNavigate();
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [savingRecipe, setSavingRecipe] = useState(null);
  const allRecipes = recipes || [];

  console.log('RecipeItems component recipes:', allRecipes);
  console.log('Current favorites:', favorites);
  console.log('Current my recipes:', myRecipes);

  // Load favorites and my recipes from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        setFavorites([]);
      }
    }

    const savedMyRecipes = localStorage.getItem('myRecipes');
    if (savedMyRecipes) {
      try {
        setMyRecipes(JSON.parse(savedMyRecipes));
      } catch (error) {
        console.error('Error parsing my recipes from localStorage:', error);
        setMyRecipes([]);
      }
    }
  }, []);

  // Save favorites and my recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('myRecipes', JSON.stringify(myRecipes));
  }, [myRecipes]);

  if (!allRecipes || allRecipes.length === 0) {
    return <div>No recipes found</div>;
  }

  const handleImageError = (e) => {
    console.log('Image failed to load, using fallback');
    e.target.src = Foodimg;
  };

  // Handle heart click to toggle favorite
  const handleHeartClick = (recipeId, event) => {
    event.stopPropagation(); // Prevent card click event
    
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.includes(recipeId);
      let newFavorites;
      
      if (isFavorite) {
        // Remove from favorites
        console.log('Removing from favorites:', recipeId);
        newFavorites = prevFavorites.filter(id => id !== recipeId);
      } else {
        // Add to favorites
        console.log('Adding to favorites:', recipeId);
        newFavorites = [...prevFavorites, recipeId];
      }
      
      // Notify parent component if callback provided
      if (onFavoritesChange) {
        onFavoritesChange(newFavorites);
      }
      
      return newFavorites;
    });
  };

  // Handle food icon click to add recipe to my recipes
  const handleFoodIconClick = async (recipe, event) => {
    event.stopPropagation(); // Prevent card click event
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      alert('আপনাকে প্রথমে লগইন করতে হবে!');
      navigate('/login');
      return;
    }
    
    // Check if recipe is already in my recipes
    if (myRecipes.includes(recipe._id)) {
      alert('এই রেসিপিটি ইতিমধ্যে আপনার মাই রেসিপিতে আছে!');
      return;
    }
    
    try {
      console.log('Adding recipe to my recipes:', recipe._id);
      setSavingRecipe(recipe._id);
      
      const response = await fetch(`http://localhost:5000/recipe/save-to-my-recipes/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${token}`
        },
        body: JSON.stringify({
          recipeId: recipe._id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save recipe');
      }
      
      const result = await response.json();
      console.log('Recipe saved successfully:', result);
      
      // Update local state
      setMyRecipes(prevMyRecipes => [...prevMyRecipes, recipe._id]);
      
      // Show success message
      alert('রেসিপিটি সফলভাবে আপনার মাই রেসিপিতে যোগ হয়েছে!');
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('রেসিপি সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSavingRecipe(null);
    }
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm('আপনি কি এই রেসিপিটি মুছে ফেলতে চান?')) {
      return;
    }

    try {
      console.log('Deleting recipe:', recipeId);
      setDeletingRecipe(recipeId); // Set the deleting state
      const response = await fetch(`http://localhost:5000/recipe/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete recipe');
      }

      const result = await response.json();
      console.log('Recipe deleted:', result);

      // Show success message
      alert('রেসিপি সফলভাবে মুছে ফেলা হয়েছে!');

      // Notify parent component
      if (onRecipeDeleted) {
        onRecipeDeleted(recipeId);
      }

      // Refresh the page to update the recipe list
      window.location.reload();

    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('রেসিপি মুছে ফেলতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setDeletingRecipe(null);
    }
  };

  const handleEdit = (recipe) => {
    console.log('Editing recipe:', recipe);
    // Navigate to edit page with recipe data
    navigate('/edit-recipe', { state: { recipe } });
  };

  return (
    <>
      <div className="card-container">
        {allRecipes.map((item, index) => {
          const isFavorite = favorites.includes(item._id);
          const isInMyRecipes = myRecipes.includes(item._id);
          
          return (
            <div key={item._id || index} className="card">
              <img
                src={item.coverImage ? `http://localhost:5000/uploads/${item.coverImage}` : Foodimg}
                alt={item.title || 'Recipe'}
                width="120px"
                height="100px"
                onError={handleImageError}
              />
              <div className="card-body">
                <div className="title">{item.title || 'No title'}</div>
                <div className="icons">
                  <div className="timer">
                    <BsStopwatchFill />{item.time || '30min'}
                  </div>
                  <div className="heart-container">
                    <FaHeart 
                      className={`heart-icon ${isFavorite ? 'favorite' : ''}`}
                      onClick={(e) => handleHeartClick(item._id, e)}
                      title={isFavorite ? 'Remove from favorites (তোমার পছন্দ থেকে সরান)' : 'Add to favorites (তোমার পছন্দে যোগ করুন)'}
                      style={{
                        cursor: 'pointer',
                        color: isFavorite ? '#e74c3c' : '#ccc',
                        transition: 'all 0.3s ease',
                        fontSize: '20px',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isFavorite) {
                          e.target.style.color = '#e74c3c';
                          e.target.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isFavorite) {
                          e.target.style.color = '#ccc';
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                    />
                    {isFavorite && (
                      <div className="favorites-indicator">❤️</div>
                    )}
                  </div>
                  <div className="food-icon-container">
                    <MdRestaurant 
                      className={`food-icon ${isInMyRecipes ? 'saved' : ''}`}
                      onClick={(e) => handleFoodIconClick(item, e)}
                      title={isInMyRecipes ? 'এই রেসিপিটি আপনার মাই রেসিপিতে আছে' : 'মাই রেসিপিতে যোগ করুন'}
                      style={{
                        cursor: isInMyRecipes ? 'default' : 'pointer',
                        color: isInMyRecipes ? '#28a745' : '#666',
                        transition: 'all 0.3s ease',
                        fontSize: '20px',
                        position: 'relative',
                        opacity: savingRecipe === item._id ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isInMyRecipes && savingRecipe !== item._id) {
                          e.target.style.color = '#28a745';
                          e.target.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isInMyRecipes && savingRecipe !== item._id) {
                          e.target.style.color = '#666';
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                    />
                    {isInMyRecipes && (
                      <div className="saved-indicator">🍽️</div>
                    )}
                    {savingRecipe === item._id && (
                      <div className="saving-indicator">⏳</div>
                    )}
                  </div>
                </div>
               
                {/* Edit and Delete Buttons */}
                <div className="recipe-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(item)}
                    title="এডিট করুন"
                    aria-label="Edit recipe"
                  >
                    <FaEdit size={16} />
                    <span style={{ marginLeft: '4px' }}>Edit</span>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingRecipe === item._id}
                    title="মুছে ফেলুন"
                    aria-label="Delete recipe"
                  >
                    <FaTrash size={16} />
                    <span style={{ marginLeft: '4px' }}>
                      {deletingRecipe === item._id ? 'Deleting...' : 'Delete'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}