const validateUsername = (username) => {
  if (typeof username !== 'string' || username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  return true;
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return true;
};

module.exports = { validateUsername, validatePassword };