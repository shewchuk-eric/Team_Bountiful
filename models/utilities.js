const Joi = require('joi');

const userSchema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(4).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required() // 8-30 characters, alphanumeric
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
    const day = String(today.getDate()).padStart(2, '0'); // Add leading zero for single-digit days
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const year = today.getFullYear();

    // Format the date as desired (e.g., MM/DD/YYYY)
    return formattedDate = `${year}-${month}-${day}`;
}



module.exports = { userSchema, requireLogin, getToday };