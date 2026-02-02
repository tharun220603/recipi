// Admin authorization middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Check if user is owner or admin
const ownerOrAdmin = (resourceUserId) => {
    return (req, res, next) => {
        const userId = req.user._id.toString();
        const ownerId = typeof resourceUserId === 'function'
            ? resourceUserId(req)
            : resourceUserId;

        if (userId === ownerId || req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify your own resources.'
            });
        }
    };
};

module.exports = { admin, ownerOrAdmin };
