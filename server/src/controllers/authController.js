const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const prisma = require('../config/db');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return next(error);

    const { username, password } = value;

    // Admin can log in using either username or email
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const payload = {
      id: admin.id,
      username: admin.username,
      email: admin.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_vivek_steel_skylines_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          username: admin.username,
          email: admin.email
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
