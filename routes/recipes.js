const express = require('express');
const router = express.Router();
const {
    createRecipe,
    getRecipes,
    getFeed,
    getRecipe,
    updateRecipe,
    deleteRecipe,
    toggleLike,
    addComment,
    deleteComment,
    searchRecipes,
    getRecommendations,
    getExplore
} = require('../controllers/recipeController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', getRecipes);
router.get('/search', searchRecipes);
router.get('/explore', getExplore);

// Protected routes
router.get('/feed', protect, getFeed);
router.post('/', protect, createRecipe);

// Single recipe routes (must be after other /recipes/* routes)
router.get('/:id', optionalAuth, getRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

// Like and comment routes
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

// Recommendations
router.get('/:id/recommendations', getRecommendations);

module.exports = router;
