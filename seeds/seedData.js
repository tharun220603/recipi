const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Recipe = require('../models/Recipe');

const users = [
    {
        username: 'chefjulia',
        email: 'julia@example.com',
        password: 'password123',
        name: 'Julia Roberts',
        bio: '🍳 Professional Chef | 15 years experience | Sharing my culinary journey',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        role: 'user',
        isVerified: true
    },
    {
        username: 'foodielover',
        email: 'foodie@example.com',
        password: 'password123',
        name: 'Alex Thompson',
        bio: '🌮 Food blogger | Home cook | Exploring flavors around the world',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'user',
        isVerified: false
    },
    {
        username: 'healthychef',
        email: 'healthy@example.com',
        password: 'password123',
        name: 'Sarah Green',
        bio: '🥗 Nutritionist | Healthy eating advocate | Plant-based recipes',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        role: 'user',
        isVerified: true
    },
    {
        username: 'admin',
        email: 'admin@recipehub.com',
        password: 'admin123',
        name: 'Recipe Hub Admin',
        bio: '👨‍💼 Platform Administrator',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'admin',
        isVerified: true
    },
    {
        username: 'bakingqueen',
        email: 'baker@example.com',
        password: 'password123',
        name: 'Emily Baker',
        bio: '🎂 Pastry chef | Baking tutorials | Sweet treats daily',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        role: 'user',
        isVerified: false
    }
];

const recipes = [
    {
        title: 'Classic Margherita Pizza',
        description: 'A simple yet delicious Italian classic with fresh tomatoes, mozzarella, and basil. This homemade pizza brings the authentic taste of Naples to your kitchen. The key is using high-quality ingredients and a hot oven for that perfect crispy crust.',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800',
        ingredients: [
            { name: 'Pizza dough', quantity: '1', unit: 'ball' },
            { name: 'San Marzano tomatoes', quantity: '200', unit: 'g' },
            { name: 'Fresh mozzarella', quantity: '200', unit: 'g' },
            { name: 'Fresh basil', quantity: '10', unit: 'leaves' },
            { name: 'Olive oil', quantity: '2', unit: 'tbsp' },
            { name: 'Salt', quantity: '1', unit: 'tsp' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Preheat your oven to the highest setting (250°C/480°F) with a pizza stone or baking sheet inside.', duration: 30 },
            { stepNumber: 2, instruction: 'Stretch the pizza dough into a 12-inch circle on a floured surface.', duration: 5 },
            { stepNumber: 3, instruction: 'Crush the San Marzano tomatoes by hand and spread evenly over the dough, leaving a 1-inch border.', duration: 3 },
            { stepNumber: 4, instruction: 'Tear the mozzarella into pieces and distribute over the pizza.', duration: 2 },
            { stepNumber: 5, instruction: 'Drizzle with olive oil and season with salt.', duration: 1 },
            { stepNumber: 6, instruction: 'Bake for 8-10 minutes until the crust is golden and cheese is bubbly.', duration: 10 },
            { stepNumber: 7, instruction: 'Top with fresh basil leaves and serve immediately.', duration: 1 }
        ],
        cookingTime: { prep: 15, cook: 10 },
        servings: 2,
        difficulty: 'Medium',
        cuisine: 'Italian',
        dietaryType: 'Veg',
        category: 'Dinner',
        tags: ['pizza', 'italian', 'vegetarian', 'homemade', 'classic'],
        calories: 850
    },
    {
        title: 'Creamy Butter Chicken',
        description: 'Rich and creamy Indian butter chicken (Murgh Makhani) made with tender chicken in a velvety tomato-based sauce. This restaurant-style dish is perfect for a cozy dinner at home.',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
        ingredients: [
            { name: 'Chicken thighs', quantity: '500', unit: 'g' },
            { name: 'Yogurt', quantity: '1', unit: 'cup' },
            { name: 'Tomato puree', quantity: '400', unit: 'g' },
            { name: 'Heavy cream', quantity: '200', unit: 'ml' },
            { name: 'Butter', quantity: '4', unit: 'tbsp' },
            { name: 'Garam masala', quantity: '2', unit: 'tsp' },
            { name: 'Ginger-garlic paste', quantity: '2', unit: 'tbsp' },
            { name: 'Kashmiri red chili powder', quantity: '1', unit: 'tsp' },
            { name: 'Turmeric', quantity: '0.5', unit: 'tsp' },
            { name: 'Sugar', quantity: '1', unit: 'tsp' },
            { name: 'Salt', quantity: 'to taste', unit: '' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Marinate chicken with yogurt, half the garam masala, turmeric, and salt for 2 hours.', duration: 120 },
            { stepNumber: 2, instruction: 'Grill or pan-fry the marinated chicken pieces until charred. Set aside.', duration: 15 },
            { stepNumber: 3, instruction: 'In a large pan, melt butter and sauté ginger-garlic paste until fragrant.', duration: 3 },
            { stepNumber: 4, instruction: 'Add tomato puree and cook for 10 minutes until oil separates.', duration: 10 },
            { stepNumber: 5, instruction: 'Add chili powder, remaining garam masala, sugar, and salt. Mix well.', duration: 2 },
            { stepNumber: 6, instruction: 'Pour in the heavy cream and simmer for 5 minutes.', duration: 5 },
            { stepNumber: 7, instruction: 'Add the grilled chicken and simmer for another 10 minutes.', duration: 10 },
            { stepNumber: 8, instruction: 'Garnish with cream and serve with naan or rice.', duration: 2 }
        ],
        cookingTime: { prep: 30, cook: 45 },
        servings: 4,
        difficulty: 'Medium',
        cuisine: 'Indian',
        dietaryType: 'Non-Veg',
        category: 'Dinner',
        tags: ['indian', 'chicken', 'curry', 'creamy', 'comfort-food'],
        calories: 650
    },
    {
        title: 'Vegan Buddha Bowl',
        description: 'A nourishing and colorful bowl packed with roasted vegetables, quinoa, chickpeas, and creamy tahini dressing. Perfect for a healthy and satisfying meal.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        ingredients: [
            { name: 'Quinoa', quantity: '1', unit: 'cup' },
            { name: 'Chickpeas', quantity: '1', unit: 'can' },
            { name: 'Sweet potato', quantity: '1', unit: 'large' },
            { name: 'Broccoli', quantity: '2', unit: 'cups' },
            { name: 'Avocado', quantity: '1', unit: 'whole' },
            { name: 'Kale', quantity: '2', unit: 'cups' },
            { name: 'Tahini', quantity: '3', unit: 'tbsp' },
            { name: 'Lemon juice', quantity: '2', unit: 'tbsp' },
            { name: 'Maple syrup', quantity: '1', unit: 'tbsp' },
            { name: 'Olive oil', quantity: '2', unit: 'tbsp' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Cook quinoa according to package instructions and set aside.', duration: 20 },
            { stepNumber: 2, instruction: 'Preheat oven to 200°C (400°F). Cube sweet potato and toss with olive oil.', duration: 5 },
            { stepNumber: 3, instruction: 'Roast sweet potato and chickpeas for 25-30 minutes until crispy.', duration: 30 },
            { stepNumber: 4, instruction: 'Steam broccoli until tender-crisp, about 5 minutes.', duration: 5 },
            { stepNumber: 5, instruction: 'Make tahini dressing: whisk tahini, lemon juice, maple syrup, and water until smooth.', duration: 3 },
            { stepNumber: 6, instruction: 'Massage kale with a little olive oil and salt until softened.', duration: 2 },
            { stepNumber: 7, instruction: 'Assemble bowls with quinoa, roasted veggies, kale, sliced avocado, and drizzle with dressing.', duration: 5 }
        ],
        cookingTime: { prep: 15, cook: 35 },
        servings: 2,
        difficulty: 'Easy',
        cuisine: 'American',
        dietaryType: 'Vegan',
        category: 'Lunch',
        tags: ['vegan', 'healthy', 'buddha-bowl', 'meal-prep', 'gluten-free'],
        calories: 520
    },
    {
        title: 'Japanese Ramen',
        description: 'Authentic Japanese ramen with rich tonkotsu-style broth, perfectly soft-boiled eggs, tender chashu pork, and fresh toppings. A bowl of pure comfort.',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        ingredients: [
            { name: 'Ramen noodles', quantity: '400', unit: 'g' },
            { name: 'Pork belly', quantity: '500', unit: 'g' },
            { name: 'Chicken broth', quantity: '8', unit: 'cups' },
            { name: 'Soy sauce', quantity: '4', unit: 'tbsp' },
            { name: 'Mirin', quantity: '2', unit: 'tbsp' },
            { name: 'Eggs', quantity: '4', unit: 'whole' },
            { name: 'Green onions', quantity: '4', unit: 'stalks' },
            { name: 'Nori sheets', quantity: '4', unit: 'sheets' },
            { name: 'Garlic', quantity: '4', unit: 'cloves' },
            { name: 'Ginger', quantity: '2', unit: 'inch' },
            { name: 'Sesame oil', quantity: '1', unit: 'tbsp' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Marinate pork belly in soy sauce and mirin for 2 hours, then braise until tender (2-3 hours).', duration: 180 },
            { stepNumber: 2, instruction: 'Prepare soft-boiled eggs: boil for 6.5 minutes, then cool in ice water and peel.', duration: 15 },
            { stepNumber: 3, instruction: 'Make the broth: simmer chicken broth with garlic, ginger, and pork braising liquid for 30 minutes.', duration: 30 },
            { stepNumber: 4, instruction: 'Cook ramen noodles according to package instructions.', duration: 4 },
            { stepNumber: 5, instruction: 'Slice the chashu pork into thin pieces.', duration: 5 },
            { stepNumber: 6, instruction: 'Assemble: place noodles in bowl, pour hot broth, top with chashu, halved egg, nori, and green onions.', duration: 5 }
        ],
        cookingTime: { prep: 30, cook: 180 },
        servings: 4,
        difficulty: 'Hard',
        cuisine: 'Japanese',
        dietaryType: 'Non-Veg',
        category: 'Dinner',
        tags: ['japanese', 'ramen', 'noodles', 'soup', 'comfort-food'],
        calories: 780
    },
    {
        title: 'Classic Chocolate Chip Cookies',
        description: 'Perfectly chewy chocolate chip cookies with crispy edges and gooey centers. This recipe uses brown butter for extra depth of flavor. A timeless American classic!',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
        ingredients: [
            { name: 'All-purpose flour', quantity: '2.25', unit: 'cups' },
            { name: 'Butter', quantity: '1', unit: 'cup' },
            { name: 'Brown sugar', quantity: '0.75', unit: 'cup' },
            { name: 'White sugar', quantity: '0.5', unit: 'cup' },
            { name: 'Eggs', quantity: '2', unit: 'large' },
            { name: 'Vanilla extract', quantity: '2', unit: 'tsp' },
            { name: 'Baking soda', quantity: '1', unit: 'tsp' },
            { name: 'Salt', quantity: '1', unit: 'tsp' },
            { name: 'Chocolate chips', quantity: '2', unit: 'cups' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Brown the butter in a saucepan until fragrant and golden. Cool slightly.', duration: 10 },
            { stepNumber: 2, instruction: 'Whisk together flour, baking soda, and salt in a bowl.', duration: 2 },
            { stepNumber: 3, instruction: 'Beat the browned butter with both sugars until fluffy.', duration: 3 },
            { stepNumber: 4, instruction: 'Add eggs one at a time, then vanilla. Mix until combined.', duration: 2 },
            { stepNumber: 5, instruction: 'Gradually add flour mixture and mix until just combined.', duration: 2 },
            { stepNumber: 6, instruction: 'Fold in chocolate chips.', duration: 1 },
            { stepNumber: 7, instruction: 'Chill dough for at least 30 minutes (or overnight for best results).', duration: 30 },
            { stepNumber: 8, instruction: 'Scoop dough balls onto baking sheet and bake at 190°C (375°F) for 10-12 minutes.', duration: 12 }
        ],
        cookingTime: { prep: 20, cook: 12 },
        servings: 24,
        difficulty: 'Easy',
        cuisine: 'American',
        dietaryType: 'Veg',
        category: 'Dessert',
        tags: ['cookies', 'chocolate', 'baking', 'dessert', 'american'],
        calories: 180
    },
    {
        title: 'Fresh Spring Rolls with Peanut Sauce',
        description: 'Light and refreshing Vietnamese spring rolls filled with fresh vegetables, herbs, and shrimp. Served with a creamy peanut dipping sauce.',
        image: 'https://images.unsplash.com/photo-1544444063-c3bd3c74c8d9?w=800',
        ingredients: [
            { name: 'Rice paper wrappers', quantity: '12', unit: 'sheets' },
            { name: 'Cooked shrimp', quantity: '200', unit: 'g' },
            { name: 'Rice vermicelli', quantity: '100', unit: 'g' },
            { name: 'Lettuce', quantity: '1', unit: 'head' },
            { name: 'Carrots', quantity: '2', unit: 'medium' },
            { name: 'Cucumber', quantity: '1', unit: 'medium' },
            { name: 'Fresh mint', quantity: '1', unit: 'bunch' },
            { name: 'Fresh cilantro', quantity: '1', unit: 'bunch' },
            { name: 'Peanut butter', quantity: '0.5', unit: 'cup' },
            { name: 'Hoisin sauce', quantity: '3', unit: 'tbsp' },
            { name: 'Sriracha', quantity: '1', unit: 'tsp' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Cook rice vermicelli according to package, rinse with cold water and set aside.', duration: 10 },
            { stepNumber: 2, instruction: 'Julienne carrots and cucumber into thin strips.', duration: 5 },
            { stepNumber: 3, instruction: 'Make peanut sauce: mix peanut butter, hoisin, sriracha, and warm water until smooth.', duration: 3 },
            { stepNumber: 4, instruction: 'Dip rice paper in warm water for 10 seconds until pliable.', duration: 1 },
            { stepNumber: 5, instruction: 'Layer lettuce, vermicelli, vegetables, herbs, and shrimp on the wrapper.', duration: 2 },
            { stepNumber: 6, instruction: 'Fold sides in and roll tightly. Repeat with remaining wrappers.', duration: 15 },
            { stepNumber: 7, instruction: 'Serve immediately with peanut dipping sauce.', duration: 1 }
        ],
        cookingTime: { prep: 30, cook: 10 },
        servings: 6,
        difficulty: 'Easy',
        cuisine: 'Vietnamese',
        dietaryType: 'Non-Veg',
        category: 'Appetizer',
        tags: ['vietnamese', 'spring-rolls', 'healthy', 'fresh', 'appetizer'],
        calories: 220
    },
    {
        title: 'Avocado Toast with Poached Egg',
        description: 'The ultimate brunch classic! Creamy smashed avocado on crusty sourdough topped with a perfectly poached egg and everything bagel seasoning.',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
        ingredients: [
            { name: 'Sourdough bread', quantity: '2', unit: 'slices' },
            { name: 'Ripe avocado', quantity: '1', unit: 'large' },
            { name: 'Eggs', quantity: '2', unit: 'whole' },
            { name: 'Lemon juice', quantity: '1', unit: 'tsp' },
            { name: 'Red pepper flakes', quantity: '0.25', unit: 'tsp' },
            { name: 'Everything bagel seasoning', quantity: '1', unit: 'tsp' },
            { name: 'Salt', quantity: 'to taste', unit: '' },
            { name: 'White vinegar', quantity: '1', unit: 'tbsp' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Toast the sourdough bread until golden and crispy.', duration: 3 },
            { stepNumber: 2, instruction: 'Mash avocado with lemon juice, salt, and red pepper flakes.', duration: 2 },
            { stepNumber: 3, instruction: 'Bring a pot of water to gentle simmer, add vinegar.', duration: 5 },
            { stepNumber: 4, instruction: 'Create a gentle whirlpool and carefully drop in egg. Poach for 3-4 minutes.', duration: 4 },
            { stepNumber: 5, instruction: 'Spread mashed avocado generously on toast.', duration: 1 },
            { stepNumber: 6, instruction: 'Top with poached egg, sprinkle with everything bagel seasoning.', duration: 1 }
        ],
        cookingTime: { prep: 5, cook: 10 },
        servings: 2,
        difficulty: 'Easy',
        cuisine: 'American',
        dietaryType: 'Veg',
        category: 'Breakfast',
        tags: ['breakfast', 'brunch', 'avocado', 'eggs', 'healthy'],
        calories: 380
    },
    {
        title: 'Thai Green Curry',
        description: 'Aromatic Thai green curry with tender chicken, bamboo shoots, and Thai basil in creamy coconut milk. Perfectly balanced sweet, spicy, and savory flavors.',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
        ingredients: [
            { name: 'Chicken breast', quantity: '500', unit: 'g' },
            { name: 'Coconut milk', quantity: '400', unit: 'ml' },
            { name: 'Green curry paste', quantity: '3', unit: 'tbsp' },
            { name: 'Bamboo shoots', quantity: '200', unit: 'g' },
            { name: 'Thai eggplant', quantity: '150', unit: 'g' },
            { name: 'Thai basil', quantity: '1', unit: 'cup' },
            { name: 'Fish sauce', quantity: '2', unit: 'tbsp' },
            { name: 'Palm sugar', quantity: '1', unit: 'tbsp' },
            { name: 'Kaffir lime leaves', quantity: '4', unit: 'leaves' },
            { name: 'Vegetable oil', quantity: '2', unit: 'tbsp' },
            { name: 'Red chili', quantity: '2', unit: 'pieces' }
        ],
        steps: [
            { stepNumber: 1, instruction: 'Slice chicken into bite-sized pieces.', duration: 5 },
            { stepNumber: 2, instruction: 'Heat oil in wok over medium-high heat. Fry curry paste until fragrant, 2 minutes.', duration: 2 },
            { stepNumber: 3, instruction: 'Add half the coconut milk and cook until oil separates.', duration: 3 },
            { stepNumber: 4, instruction: 'Add chicken and cook until no longer pink on the outside.', duration: 5 },
            { stepNumber: 5, instruction: 'Add remaining coconut milk, bamboo shoots, eggplant, and kaffir lime leaves.', duration: 2 },
            { stepNumber: 6, instruction: 'Simmer for 10-15 minutes until vegetables are tender.', duration: 15 },
            { stepNumber: 7, instruction: 'Season with fish sauce and palm sugar. Taste and adjust.', duration: 1 },
            { stepNumber: 8, instruction: 'Stir in Thai basil, top with sliced chilies. Serve with jasmine rice.', duration: 2 }
        ],
        cookingTime: { prep: 15, cook: 25 },
        servings: 4,
        difficulty: 'Medium',
        cuisine: 'Thai',
        dietaryType: 'Non-Veg',
        category: 'Dinner',
        tags: ['thai', 'curry', 'spicy', 'coconut', 'asian'],
        calories: 480
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Recipe.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const createdUsers = await User.create(users);
        console.log(`Created ${createdUsers.length} users`);

        // Create recipes with random authors and engagement
        const recipesWithAuthors = recipes.map((recipe, index) => {
            const authorIndex = index % (createdUsers.length - 1); // Exclude admin
            const author = createdUsers[authorIndex];

            // Add random likes from other users
            const otherUsers = createdUsers.filter(u => u._id.toString() !== author._id.toString());
            const randomLikes = otherUsers
                .slice(0, Math.floor(Math.random() * otherUsers.length))
                .map(u => u._id);

            return {
                ...recipe,
                author: author._id,
                likes: randomLikes
            };
        });

        const createdRecipes = await Recipe.create(recipesWithAuthors);
        console.log(`Created ${createdRecipes.length} recipes`);

        // Add some followers relationships
        const julia = createdUsers[0];
        const foodie = createdUsers[1];
        const healthy = createdUsers[2];
        const baker = createdUsers[4];

        // Julia follows foodie and healthy
        julia.following.push(foodie._id, healthy._id);
        foodie.followers.push(julia._id);
        healthy.followers.push(julia._id);

        // Foodie follows julia and baker
        foodie.following.push(julia._id, baker._id);
        julia.followers.push(foodie._id);
        baker.followers.push(foodie._id);

        // Save updates
        await julia.save();
        await foodie.save();
        await healthy.save();
        await baker.save();

        console.log('Added follower relationships');
        console.log('\n✅ Database seeded successfully!\n');
        console.log('Test accounts:');
        console.log('  User: foodie@example.com / password123');
        console.log('  Admin: admin@recipehub.com / admin123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
