const Joi = require('joi');

const userSchema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50),
    email: Joi.string().email().required(),
    userName: Joi.string().alphanum().min(4).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(), // 8-30 characters, alphanumeric
    accessLevel: Joi.string().valid('user', 'admin').required(),
    accountModified: Joi.strip()
});


// authentication
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized. Please log in via OAuth.' });
}

// admin
function ensureAdmin(req, res, next) {
  if (req.session && req.session.isLoggedIn && req.session.userLevel === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden. Admin access required.' });
}

module.exports = { userSchema, requireLogin, getToday, ensureAuthenticated, ensureAdmin };

function getToday() {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    const formattedDate = formatter.format(today);
    return formattedDate;
}



module.exports = { userSchema, requireLogin, getToday };