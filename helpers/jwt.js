import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const createToken = (id) => {
    try {
        const payload = { id };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // Return the generated JWT
        return token;
    } catch (error) {
        // Handle any errors that occur during JWT generation
        throw new Error(`Error generating JWT: ${error.message}`);
    }
};

export default createToken;