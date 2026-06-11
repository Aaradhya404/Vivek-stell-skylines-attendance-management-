const bcrypt = require('bcryptjs');
const Joi = require('joi');
const prisma = require('../config/db');

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Confirm password must match new password' })
});

exports.changePassword = async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) return next(error);

    const { currentPassword, newPassword } = value;
    const adminId = req.admin.id;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};
