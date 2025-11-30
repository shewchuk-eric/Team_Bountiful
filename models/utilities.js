const Joi = require('joi');

const userSchema = Joi.object({
  firstName: Joi.string().min(3).max(50).required(),
  lastName: Joi.string().min(3).max(50),
  email: Joi.string().email().required(),
  userName: Joi.string().alphanum().min(4).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(), // 8-30 characters, alphanumeric
  accessLevel: Joi.string().valid('user', 'admin').required(),
  accountModified: Joi.strip(),
  gitName: Joi.strip()
});

const characterSchema = Joi.object({
  characterName: Joi.string().min(3).max(50).required(),
  firstBookSeen: Joi.string().min(4).max(20).allow('').required(),
  firstVerseSeen: Joi.string().min(3).max(10).required(),
  quality: Joi.string().min(4).max(10).required(),
  notes: Joi.string().max(1500).allow('').optional()
});

const quoteSchema = Joi.object({
  characterId: Joi.string().pattern(new RegExp('^[0-9a-fA-F]{24}$')).required(),
  characterName: Joi.string().min(3).max(50).required(),
  bookName: Joi.string().min(4).max(20).allow('').required(),
  verse: Joi.string().min(3).max(10).required(),
  // whereFound: Joi.string().min(4).max(20).required(),
  characterQuality: Joi.string().min(4).max(10).required(),
  text: Joi.string().max(500).required()
});

const imageSchema = Joi.object({
  characterId: Joi.strip(), // will be added in controller
  characterName: Joi.string().min(3).max(50).required(),
  bookWhereSeen: Joi.string().min(4).max(20).required(),
  characterQuality: Joi.string().min(4).max(10).required(),
  filename: Joi.string().max(50).required(),
  caption: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(1500).allow('').optional(),
  source: Joi.string().uri().required()
});

function requireLogin(req, res, next) { //works as is with GitHub OAuth - need to adjust for username/password auth
  console.log('requireLogin session info:', req.session.isLoggedIn);
  if (req.session.isLoggedIn) {
    //console.log('User is logged in as:', req.session.accessLevel);
    return (true); // User is logged in, continue to the route handler
  } else {
    return (false)
  }
}

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



module.exports = {
  userSchema,
  characterSchema,
  quoteSchema,
  imageSchema,
  requireLogin,
  getToday
};