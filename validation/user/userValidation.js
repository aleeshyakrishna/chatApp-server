// userValidation.js

import Joi from "joi";

// Signup validation
const signupValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).optional().label("Name"),
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().min(6).max(100).required().label("Password"),
    });

    return schema.validate(data);
};

// Login validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });

    return schema.validate(data);
};

export { signupValidation, loginValidation };
