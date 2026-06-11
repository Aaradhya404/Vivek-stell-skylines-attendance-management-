const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_vivek_steel_skylines_2026');
    
    req.admin = decoded;
    next();
  } catch (error) {
    logger.warn(`Failed login or authentication attempt: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = { authenticateAdmin };
