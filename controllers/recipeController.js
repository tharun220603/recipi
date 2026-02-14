const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
    try {
        const recipeData = {
            ...req.body,
            author: req.user._id
        };

        const recipe = await Recipe.create(recipeData);

        const populatedRecipe = await Recipe.findById(recipe._id)
            .populate('author', 'username name profileImage');

        res.status(201).json({
            success: true,
            message: 'Recipe created successfully',
            data: populatedRecipe
        });
    } catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all recipes (feed)
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { isPublished: true };

        const recipes = await Recipe.find(filter)
            .populate('author', 'username name profileImage isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Recipe.countDocuments(filter);

        res.json({
            success: true,
            data: recipes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get personalized feed (recipes from followed users)
// @route   GET /api/recipes/feed
// @access  Private
const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user._id);
        const following = user.following;

        // Include own recipes and followed users' recipes
        const filter = {
            isPublished: true,
            author: { $in: [...following, req.user._id] }
        };

        const recipes = await Recipe.find(filter)
            .populate('author', 'username name profileImage isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Recipe.countDocuments(filter);

        res.json({
            success: true,
            data: recipes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
const getRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('author', 'username name profileImage isVerified followers')
            .populate('comments.user', 'username name profileImage')
            .populate('comments.replies.user', 'username name profileImage');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Increment view count
        recipe.viewCount += 1;
        await recipe.save();

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private (Owner/Admin)
const updateRecipe = async (req, res) => {
    try {
        let recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check ownership
        if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this recipe'
            });
        }

        recipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('author', 'username name profileImage');

        res.json({
            success: true,
            message: 'Recipe updated successfully',
            data: recipe
        });
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private (Owner/Admin)
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check ownership
        if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this recipe'
            });
        }

        await Recipe.findByIdAndDelete(req.params.id);

        // Remove from saved recipes
        await User.updateMany(
            { savedRecipes: req.params.id },
            { $pull: { savedRecipes: req.params.id } }
        );

        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Like/Unlike recipe
// @route   POST /api/recipes/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const userId = req.user._id;
        const isLiked = recipe.likes.includes(userId);

        if (isLiked) {
            // Unlike
            recipe.likes = recipe.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Like
            recipe.likes.push(userId);

            // Create notification (don't notify self)
            if (recipe.author.toString() !== userId.toString()) {
                await Notification.create({
                    recipient: recipe.author,
                    sender: userId,
                    type: 'like',
                    recipe: recipe._id,
                    message: `${req.user.username} liked your recipe`
                });
            }
        }

        await recipe.save();

        res.json({
            success: true,
            data: {
                isLiked: !isLiked,
                likeCount: recipe.likes.length
            }
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add comment
// @route   POST /api/recipes/:id/comment
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const comment = {
            user: req.user._id,
            text: text.trim()
        };

        recipe.comments.push(comment);
        await recipe.save();

        // Create notification
        if (recipe.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: recipe.author,
                sender: req.user._id,
                type: 'comment',
                recipe: recipe._id,
                message: `${req.user.username} commented on your recipe`
            });
        }

        // Populate the new comment
        const updatedRecipe = await Recipe.findById(req.params.id)
            .populate('comments.user', 'username name profileImage');

        res.status(201).json({
            success: true,
            message: 'Comment added',
            data: updatedRecipe.comments
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete comment
// @route   DELETE /api/recipes/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const comment = recipe.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment or is admin
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        recipe.comments = recipe.comments.filter(c => c._id.toString() !== req.params.commentId);
        await recipe.save();

        res.json({
            success: true,
            message: 'Comment deleted'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Search recipes
// @route   GET /api/recipes/search
// @access  Public
const searchRecipes = async (req, res) => {
    try {
        const { q, cuisine, dietary, difficulty, ingredient, category, sort } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { isPublished: true };

        // Text search
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ];
        }

        // Filters
        if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' };
        if (dietary) filter.dietaryType = dietary;
        if (difficulty) filter.difficulty = difficulty;
        if (category) filter.category = category;
        if (ingredient) {
            filter['ingredients.name'] = { $regex: ingredient, $options: 'i' };
        }

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { likeCount: -1, viewCount: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const recipes = await Recipe.find(filter)
            .populate('author', 'username name profileImage isVerified')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const total = await Recipe.countDocuments(filter);

        res.json({
            success: true,
            data: recipes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get recipe recommendations
// @route   GET /api/recipes/:id/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Find similar recipes by cuisine, dietary type, and category
        const recommendations = await Recipe.find({
            _id: { $ne: recipe._id },
            isPublished: true,
            $or: [
                { cuisine: recipe.cuisine },
                { dietaryType: recipe.dietaryType },
                { category: recipe.category },
                { tags: { $in: recipe.tags } }
            ]
        })
            .populate('author', 'username name profileImage')
            .limit(6)
            .sort({ likeCount: -1 });

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get trending/explore recipes
// @route   GET /api/recipes/explore
// @access  Public
const getExplore = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Get trending recipes (most liked in last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const recipes = await Recipe.aggregate([
            {
                $match: {
                    isPublished: true,
                    createdAt: { $gte: lastWeek }
                }
            },
            {
                $addFields: {
                    likeCount: { $size: '$likes' },
                    commentCount: { $size: '$comments' }
                }
            },
            {
                $sort: { likeCount: -1, viewCount: -1 }
            },
            { $skip: skip },
            { $limit: limit }
        ]);

        // Populate author info
        await Recipe.populate(recipes, {
            path: 'author',
            select: 'username name profileImage isVerified'
        });

        res.json({
            success: true,
            data: recipes
        });
    } catch (error) {
        console.error('Get explore error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get public analytics/stats for dashboard
// @route   GET /api/recipes/analytics
// @access  Public
const getAnalytics = async (req, res) => {
    try {
        // Recipes by cuisine
        const byCuisine = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$cuisine', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Recipes by difficulty
        const byDifficulty = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$difficulty', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recipes by dietary type
        const byDietaryType = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$dietaryType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recipes by category
        const byCategory = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Monthly recipe activity (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyActivity = await Recipe.aggregate([
            { $match: { isPublished: true, createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    recipes: { $sum: 1 },
                    totalLikes: { $sum: { $size: '$likes' } },
                    totalComments: { $sum: { $size: '$comments' } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Top recipes by likes
        const topRecipes = await Recipe.find({ isPublished: true })
            .sort({ likes: -1 })
            .limit(5)
            .select('title likes viewCount comments cuisine author')
            .populate('author', 'username name');

        // Top contributors (users with most recipes)
        const topContributors = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$author', recipes: { $sum: 1 }, totalLikes: { $sum: { $size: '$likes' } } } },
            { $sort: { recipes: -1 } },
            { $limit: 8 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { username: '$user.username', name: '$user.name', recipes: 1, totalLikes: 1 } }
        ]);

        // Summary stats
        const totalRecipes = await Recipe.countDocuments({ isPublished: true });
        const totalUsers = await User.countDocuments();
        const totalLikesAgg = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
        ]);
        const totalCommentsAgg = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: null, total: { $sum: { $size: '$comments' } } } }
        ]);

        res.json({
            success: true,
            data: {
                summary: {
                    totalRecipes,
                    totalUsers,
                    totalLikes: totalLikesAgg[0]?.total || 0,
                    totalComments: totalCommentsAgg[0]?.total || 0
                },
                byCuisine,
                byDifficulty,
                byDietaryType,
                byCategory,
                monthlyActivity,
                topRecipes,
                topContributors
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
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
    getExplore,
    getAnalytics
};
