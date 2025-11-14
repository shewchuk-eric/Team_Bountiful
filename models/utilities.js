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

function requireLogin(req, res, next) { //works as is with GitHub OAuth - need to adjust for username/password auth
  if (req.session.isLoggedIn) {
    let userCreds = {
      "username": req.session.username,
      "userLevel": req.session.userLevel
    }
    return(userCreds); // User is logged in, continue to the route handler
  } else {
    return(false)
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
    console.log(formattedDate);
    return formattedDate;
}



module.exports = { userSchema, requireLogin, getToday };