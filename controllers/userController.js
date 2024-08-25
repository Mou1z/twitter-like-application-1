const User = require('../models/user');
const Post = require('../models/post');
const { hashPassword, comparePassword } = require('../utils/auth');
const { validateUsername, validatePassword } = require('../utils/validation');
const { handleError } = require('../utils/errorHandler');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    validateUsername(username);
    validatePassword(password);
    
    User.findUser(username, async (err, user) => {
      if (err) return handleError(res, 'Error querying the database', 500);
      if (user) return handleError(res, 'User already exists', 400);

      const hashedPassword = await hashPassword(password);
      User.createUser(username, hashedPassword, (err, userId) => {
        if (err) return handleError(res, 'Error creating user', 500);
        res.redirect('/login');
      });
    });
  } catch (error) {
    return handleError(res, error.message, 400);
  }
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  try {
    validateUsername(username);
    validatePassword(password);
    
    User.findUser(username, async (err, user) => {
      if (err) return handleError(res, 'Error querying the database', 500);
      if (!user) return handleError(res, 'Invalid credentials', 400);

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) return handleError(res, 'Invalid credentials', 400);

      req.session.user = user;
      res.redirect('/');
    });
  } catch (error) {
    return handleError(res, error.message, 400);
  }
};

exports.createPost = (req, res) => {
  if (!req.session.user) {
    return handleError(res, 'Unauthorized', 401);
  }
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return handleError(res, 'Content cannot be empty', 400);
  }
  Post.createPost(req.session.user.username, content, (err, postId) => {
    if (err) {
      return handleError(res, 'Error creating post', 500);
    }
    res.redirect('/');
  });
};

exports.getPosts = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  Post.getPosts((err, posts) => {
    if (err) {
      return handleError(res, 'Error retrieving posts', 500);
    }
    res.render('home', { user: req.session.user, posts });
  });
};