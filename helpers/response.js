import statusCodes from "../utils/constants.js";

const success = (
    res,
    statusCode = statusCodes.SUCCESS,
    message = "",
    data = null
) => {
    res.status(statusCode).json({
        message,
        status: true,
        ...(data && { data }),
    });
};

export default success
