import statusCodes from "../utils/constants.js";

export const catchErrors = (fn) => (req, res, next) => {
    if (typeof fn !== "function") {
        throw new TypeError("fn must be a function");
    }
    return Promise.resolve(fn(req, res, next)).catch(next);
};

export const handleCustomError = (res, message, statusCode = 401, data) => {
    console.log(message,"handlingError");
    
    if (data == undefined) return res.status(statusCode).json({ message, status: false });
    else return res.status(statusCode).send({ data, status: false });
};

export const validate = (validator) => {
    return (req, res, next) => {
        const data = { ...req.body, ...req.params, ...req.query };
        const { error } = validator(data);
        // If there's a validation error, send a 400 response with the error message
        if (error) {
            const message = error.details[0].message.replace(/"/g, "");
            return res
                .status(statusCodes.BADREQUEST)
                .send({ message, status: false });
        }

        next();
    };
};
