// Use after verifyToken: requires req.user.role to match.
const checkRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};

module.exports = checkRole;
