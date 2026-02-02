const mongoose = require('mongoose');

// Comment schema (embedded)
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Main Recipe schema
const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Recipe title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Recipe description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    image: {
        type: String,
        required: [true, 'Recipe image is required']
    },
    images: [{
        type: String
    }],
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: String,
            required: true
        },
        unit: {
            type: String,
            default: ''
        }
    }],
    steps: [{
        stepNumber: {
            type: Number,
            required: true
        },
        instruction: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ''
        },
        duration: {
            type: Number, // in minutes
            default: 0
        }
    }],
    cookingTime: {
        prep: {
            type: Number, // in minutes
            default: 0
        },
        cook: {
            type: Number, // in minutes
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    servings: {
        type: Number,
        default: 4
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    cuisine: {
        type: String,
        required: [true, 'Cuisine type is required'],
        trim: true
    },
    dietaryType: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Vegan', 'Gluten-Free', 'Keto', 'Other'],
        default: 'Veg'
    },
    category: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage', 'Appetizer', 'Other'],
        default: 'Other'
    },
    tags: [{
        type: String,
        trim: true
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    calories: {
        type: Number,
        default: 0
    },
    nutrition: {
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 }
    },
    videoUrl: {
        type: String,
        default: ''
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for like count
recipeSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
recipeSchema.virtual('commentCount').get(function () {
    return this.comments ? this.comments.length : 0;
});

// Index for search
recipeSchema.index({ title: 'text', description: 'text', tags: 'text', cuisine: 'text' });
recipeSchema.index({ cuisine: 1, dietaryType: 1, difficulty: 1 });
recipeSchema.index({ author: 1, createdAt: -1 });
recipeSchema.index({ likes: 1 });

// Pre-save middleware to calculate total cooking time
recipeSchema.pre('save', function (next) {
    this.cookingTime.total = (this.cookingTime.prep || 0) + (this.cookingTime.cook || 0);
    next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
