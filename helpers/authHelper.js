import jwt from 'jsonwebtoken';
import AccountModel from '../model/user/accountModel.js';
import statusCodes from '../utils/constants.js';
export const verifyJwtToken = (token, secret) => {
    try {
        const decodedToken = jwt.verify(token, secret);
        return { status: true, decodedToken };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return {
                status: false,
                message: "Token expired. Please log in again.",
                statusCode: statusCodes.UNAUTHORIZED,
            };
        }
        return {
            status: false,
            message: "Invalid token. Please log in again.",
            statusCode: statusCodes.UNAUTHORIZED,
        };
    }
};

export const validateToken = (token) => {
    if (!token || !token.startsWith("Bearer ")) {
        return {
            status: false,
            message: "Invalid token format",
        };
    }

    const extractedToken = token.replace("Bearer ", "");

    return {
        status: true,
        token: extractedToken,
    };
};

export const fetchAccountDetails = async (accountId) => {
    return await AccountModel.findOne(
        { _id: accountId },
        {
            name: 1,
            email: 1,
            createdAt: 1,
        }
    );
};

export const hasPasswordChanged = (passwordChangedAt, tokenIssuedAt) => {
    if (!passwordChangedAt) return false;
    return passwordChangedAt > new Date(tokenIssuedAt * 1000);
};
