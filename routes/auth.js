const express = require("express");
const { body } = require("express-validator/check");
const userValidation = require("../middleware/user-validation")
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

const validateUser = (req, res, next) => {
  console.log(req.body)
  const { error } = userValidation.validateAsync(req.body); 
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  } 
  next();
};

router.post("/signup" , authController.signup);

router.post("/login", authController.login);

router.get("/users", authController.getUsers);

router.get('/users/search', authController.filterUsers);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  authController.updateUserStatus
);

module.exports = router;
