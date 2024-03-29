const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userValidation = require("../middleware/user-validation")

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  try { 

    const { error } = await userValidation.validateAsync(req.body);

    if (error) {
      return res.status(422).json({ error: error.details[0].message });
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
    });

    const result = await user.save();

    res.status(201).json({ message: 'User created!', userId: result._id });
  } catch (error) {
    console.log("CATCH")
    res.status(500).json({ status : "false",message  :"Error", response: error });
  }
};

exports.getUsers = (req, res, next) => {
  User.find()
    .then(users => {
      res.status(200).json({ message: 'Users found', users: users });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.filterUsers = async (req, res, next) => {
  try {
    const searchName = req.query.name;
    const nameRegex = new RegExp(searchName, 'i');

    const users = await User.find({ name: { $regex: nameRegex.source, $options: 'i' } });

    res.status(200).json({ message: 'Users found', users: users });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};



exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        'somesupersecretsecret',
        { expiresIn: '1h' }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUserStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ status: user.status });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateUserStatus = (req, res, next) => {
  const newStatus = req.body.status;
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      user.status = newStatus;
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'User updated.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
