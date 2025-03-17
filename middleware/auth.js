import statusCodes from "../utils/constants.js";
import {
  verifyJwtToken,
  validateToken,
  fetchAccountDetails,
  hasPasswordChanged,
} from "../helpers/authHelper.js";

const userAuth = async (req, res, next) => {
    try {
      console.log(req.header,"authorization------");
      
        const token = req.header("Authorization");
        console.log(token,"=======");
        
    const result = validateToken(token);
    if (!result.status) {
      return res.status(statusCodes.NOTFOUND).json({
        status: false,
        message: result?.message,
      });
    }

    const tokenWithoutBearer = result?.token;
    const tokenDetails = verifyJwtToken(
      tokenWithoutBearer,
      process.env.JWT_SECRET
    );

    if (!tokenDetails.status) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        status: false,
        message: "Invalid token. Please log in again.",
      });
    }
    console.log(tokenDetails, "------");

    const { id, iat } = tokenDetails?.decodedToken;

    const accountId = tokenDetails.decodedToken.id;
    let accountDetails = await fetchAccountDetails(accountId);

    if (!accountDetails) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        status: false,
        message: "Account not found or deleted",
      });
    }

    if (
      req.path !== "/logout" &&
      hasPasswordChanged(accountDetails.password, iat)
    ) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        status: false,
        message: "Password has been changed. Please log in again.",
      });
    }
    req.user = { ...accountDetails.toObject() };
    next();
  } catch (error) {
    console.error(error);
    res.status(statusCodes.ERROR).json({
      status: false,
      message: "An unexpected error occurred.",
    });
  }
};

export default userAuth;
