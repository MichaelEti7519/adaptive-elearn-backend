// middleware/roleMiddleware.js
module.exports = (roles = []) => (req, res, next) => {
  // if roles is empty, allow any authenticated user
  if (!roles || roles.length === 0) return next();
  if (!req.user) return res.status(401).json({ message: 'No user' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
