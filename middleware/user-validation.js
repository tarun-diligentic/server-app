const Joi = require("joi");
const User = require("../models/user");

const userValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .external(async (value, helper) => {
      try {
        const existingUser = await User.findOne({ email: value });
        console.log(existingUser);
        if (existingUser) {
          return helper.message(`User with this email already exists`);
        }
      } catch (err) {
        return helper.message(`Error checking email `);
      }
    }),
  password: Joi.string().required().trim().min(5),
  name: Joi.string().required().not().empty(),
  status: Joi.string().default("I am new!"),
});

module.exports = userValidation;
