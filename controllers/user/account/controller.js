import AccountModel from "../../../model/user/accountModel.js";
import createToken from "../../../helpers/jwt.js";
import bcrypt from 'bcrypt'

const doLogin = async (data) => {
    const { email, password } = data;

    let userAccountDetails = await AccountModel.findOne({ email});

console.log(data,userAccountDetails,"----------");

    if (!userAccountDetails) {
        return { status: false, message:"Invalid email" };
    }

    let validPassword = await bcrypt.compare(
        password,
        userAccountDetails.password
    );

    if (!validPassword) {
        return {
            status: false,
            message: "Invalid login credentials",
        };
    }

    const {
        _id: userId,
        email: Email,
        name:Name
    } = userAccountDetails;

    const token = createToken(userId);

    return {
        status: true,
        message: "Account logged in successfully",
        data: {
            token:token,
            user: {
                Name,
                Email,
                userId
            }
        },
    };
};

const doRegister = async (data) => {
    const { name, email, password } = data;

    // Check if user already exists
    let existingUser = await AccountModel.findOne({ email });

    if (existingUser) {
        return { status: false, message: "Email already registered" };
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new AccountModel({
        name,
        email,
        password: hashedPassword,
    });

    // Save user to database
    await newUser.save();

    return {
        status: true,
        message: "Registration successful",
    };
};


export default {
    doLogin,
    doRegister
}