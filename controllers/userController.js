const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Notification = require('../models/Notification');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-email')
            .populate('followers', 'username name profileImage')
            .populate('following', 'username name profileImage');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's recipes
        const recipes = await Recipe.find({ author: user._id, isPublished: true })
            .sort({ createdAt: -1 });

        // Check if current user follows this user
        let isFollowing = false;
        if (req.user) {
            isFollowing = user.followers.some(f => f._id.toString() === req.user._id.toString());
        }

        res.json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    recipeCount: recipes.length,
                    isFollowing
                },
                recipes
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isFollowing = currentUser.following.includes(req.params.id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== req.params.id
            );
            userToFollow.followers = userToFollow.followers.filter(
                id => id.toString() !== req.user._id.toString()
            );
        } else {
            // Follow
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user._id);

            // Create notification
            await Notification.create({
                recipient: userToFollow._id,
                sender: req.user._id,
                type: 'follow',
                message: `${req.user.username} started following you`
            });
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({
            success: true,
            data: {
                isFollowing: !isFollowing,
                followerCount: userToFollow.followers.length
            }
        });
    } catch (error) {
        console.error('Toggle follow error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers', 'username name profileImage bio isVerified');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user.followers
        });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('following', 'username name profileImage bio isVerified');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user.following
        });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Save/Unsave recipe
// @route   POST /api/users/save/:recipeId
// @access  Private
const toggleSaveRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.recipeId);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const user = await User.findById(req.user._id);
        const isSaved = user.savedRecipes.includes(req.params.recipeId);

        if (isSaved) {
            user.savedRecipes = user.savedRecipes.filter(
                id => id.toString() !== req.params.recipeId
            );
        } else {
            user.savedRecipes.push(req.params.recipeId);
        }

        await user.save();

        res.json({
            success: true,
            data: {
                isSaved: !isSaved
            }
        });
    } catch (error) {
        console.error('Toggle save recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get saved recipes
// @route   GET /api/users/saved
// @access  Private
const getSavedRecipes = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'savedRecipes',
                populate: {
                    path: 'author',
                    select: 'username name profileImage'
                }
            });

        res.json({
            success: true,
            data: user.savedRecipes
        });
    } catch (error) {
        console.error('Get saved recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's own recipes
// @route   GET /api/users/my-recipes
// @access  Private
const getMyRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ author: req.user._id })
            .populate('author', 'username name profileImage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: recipes
        });
    } catch (error) {
        console.error('Get my recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'username name profileImage')
            .populate('recipe', 'title image')
            .sort({ createdAt: -1 })
            .limit(50);

        // Count unread
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'Notifications marked as read'
        });
    } catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.json({
                success: true,
                data: []
            });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { name: { $regex: q, $options: 'i' } }
            ]
        })
            .select('username name profileImage bio isVerified')
            .limit(20);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get suggested users to follow
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestions = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        // Get users not followed by current user
        const suggestions = await User.find({
            _id: {
                $ne: req.user._id,
                $nin: currentUser.following
            }
        })
            .select('username name profileImage bio isVerified followers')
            .sort({ followers: -1 })
            .limit(10);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
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
};
