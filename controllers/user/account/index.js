import { handleCustomError } from "../../../errorHandler/index.js";
import success from "../../../helpers/response.js";
import controller from "./controller.js";
import statusCodes from "../../../utils/constants.js";
const login = async (req, res) => {
  const { message, data, status } = await controller.doLogin(req.body);
console.log(message,data,status,"data");

  if (!status) {
    return handleCustomError(res, message);
  }

  success(res, statusCodes.SUCCESS, message, data);
};

const register = async (req, res) => {
  const { message, status } = await controller.doRegister(req.body);

  if (!status) {
    return handleCustomError(res, message);
  }

  success(res, statusCodes.CREATED, message);
};

export { login, register };
