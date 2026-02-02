const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    toggleFollow,
    getFollowers,
    getFollowing,
    toggleSaveRecipe,
    getSavedRecipes,
    getMyRecipes,
    getNotifications,
    markNotificationsRead,
    searchUsers,
    getSuggestions
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/search', searchUsers);

// Protected routes
router.get('/saved', protect, getSavedRecipes);
router.get('/my-recipes', protect, getMyRecipes);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.get('/suggestions', protect, getSuggestions);
router.post('/save/:recipeId', protect, toggleSaveRecipe);

// User profile routes (must be after other /users/* routes)
router.get('/:username', optionalAuth, getUserProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
