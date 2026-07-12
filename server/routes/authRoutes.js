const router = require('express').Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);
router.put('/password', verifyToken, changePassword);
router.delete('/me', verifyToken, deleteAccount);

module.exports = router;
