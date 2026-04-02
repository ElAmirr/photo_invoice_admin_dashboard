require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.ADMIN_SESSION_TOKEN) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
};

module.exports = authMiddleware;
