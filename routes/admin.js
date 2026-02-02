const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getDashboardStats,
    updateUserRole,
    deleteUser,
    deleteRecipeAdmin,
    getAllRecipes,
    toggleFeatured,
    verifyUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// All routes require auth + admin
router.use(protect, admin);

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/verify', verifyUser);
router.delete('/users/:id', deleteUser);

// Recipe management
router.get('/recipes', getAllRecipes);
router.put('/recipes/:id/feature', toggleFeatured);
router.delete('/recipes/:id', deleteRecipeAdmin);

module.exports = router;
