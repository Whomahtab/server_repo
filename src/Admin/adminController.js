import Joi from "joi"
import {
    RegisterUserValidateSchema,
    AdminLoginValidateSchema,
    CHANGE_ADMIN_PASSWORD_SCHEMA_VALIDATION
} from "./RegisterValidateSchema.js"
import bcrypt from "bcrypt"
import createHttpError from "http-errors";
import adminModel from '../Admin/adminModel.js'
import { config } from "../config/_config.js";
import jwt from "jsonwebtoken";
import userModel from "../Users/userModel.js";
import formatDateTime from "../utils/formateDateAndTime.js";
import orderModel from '../Orders/orderModel.js';

const RegisterAdmin = async (req, res, next) => {
    try {
        // validate Req Body..
        const { error, value } = RegisterUserValidateSchema.validate(req.body);
        const reqBody = value;

        console.log(reqBody);

        if (error) {
            return next(createHttpError(401, `${error?.details[0]?.message}`))
        }
        // Check for user is Present in the DB or not..
        const isAdminExists = await adminModel.findOne(
            {
                mobileNum: reqBody.mobileNum,
                email: reqBody.email,
            }
        );

        if (isAdminExists) {
            return next(createHttpError(401, "Already Registered Please Login.."))
        }

        const hashPassword = await bcrypt.hash(reqBody.password, 10)
        if (!hashPassword) {
            return next(createHttpError(401, "Internal error."))
        }
        // On Success.
        const prettyData = {
            fullName: reqBody.fullName,
            mobileNum: reqBody.mobileNum,
            email: reqBody.email,
            password: hashPassword
        }

        const admin = await adminModel.create(prettyData)

        if (!admin) {
            return next(createHttpError(401, "Internal Error.."))
        }


        res.status(200).json({
            success: true,
            msg: "Registered successfully.."
        })

    } catch (error) {
        next(createHttpError(401, `Err ${error.message}`))
    }
}

const LoginAdmin = async (req, res, next) => {
    try {
        const { error, value } = AdminLoginValidateSchema.validate(req.body)
        // Validate body..
        if (error) {
            return next(createHttpError(401, `${error?.details[0]?.message}`))
        }
        const reqData = value;

        // Check user exist in the DB or not..

        const isAdmin = await adminModel.findOne({ email: reqData.email })

        if (!isAdmin) {
            return next(createHttpError(401, "Please Register Your account or check Your email address."))
        }

        // Check for Admin Email..
        if (isAdmin.email !== reqData.email) {
            return next(createHttpError(401, "Please enter correct email address..."))
        }

        const decodedPassword = await bcrypt.compare(reqData.password, isAdmin.password);

        if (!decodedPassword) {
            return next(createHttpError(401, "Please check your email and password.."))
        }


        // check admin email and Pass is correct or not..
        // if (isAdmin.password !== reqData.password) {
        //     console.log(isAdmin.password, "___", reqData.password);
        //     return next(createHttpError(401, "Please enter correct password.."))
        // }





        const payload = { id: isAdmin.id, role: isAdmin.role }
        const accessToken = jwt.sign(payload, config.ADMIN_SECRET)
        // Save Token Inside DB TOO..
        isAdmin.accessToken = accessToken;
        await isAdmin.save()

        // On Success

        // Log in user and send token as a response
        return res.status(200).json(
            {
                success: true,
                token: accessToken,
            }
        )

    } catch (error) {
        return next(createHttpError(401, `log from Admin Login ${error}`))
    }

}

const GET_ALL_USERS = async (req, res, next) => {
    try {

        const users = await userModel.find({}, { updatedAt: 0, __v: 0, accessToken: 0, createdAt: 0 }).limit(10)


        if (!users) {
            return next(createHttpError(401, "Error occurred during fetching users..1"))
        }
        res.json(users)


    } catch (error) {
        return next(createHttpError(401, "Unauthorized."))
    }
}

const GET_SINGLE_USERS = async (req, res, next) => {
    try {

        const USER_ID = req?.params?.USER_ID;

        if (!USER_ID) {
            return next(createHttpError(401, "Unauthorized."))
        }
        // { updatedAt: 0, __v: 0, accessToken: 0, createdAt: 0 }

        const user = await userModel.findOne({ _id: USER_ID },
            { updatedAt: 0, __v: 0, accessToken: 0, _id: 0, otp: 0 })


        if (!user) {
            return next(createHttpError(401, "Error occurred during fetching users..2"))
        }

        const join_date = formatDateTime(user.createdAt)
        const prettyData = {
            fullName: user.fullName,
            gender: user.gender,
            address: user.address,
            mobileNum: user.mobileNum,
            role: user.role,
            areaPin: user.areaPin,
            age: user.age,
            createdAt: join_date
        };



        res.json(prettyData)


    } catch (error) {
        return next(createHttpError(401, "Unauthorized."))
    }
}

const DELETE_SINGLE_USERS = async (req, res, next) => {
    try {

        const USER_ID = req?.params?.USER_ID;

        if (!USER_ID) {
            return next(createHttpError(401, "Unauthorized.."))
        }

        const user = await userModel.findOneAndDelete({ _id: USER_ID });

        if (!user) {
            return next(createHttpError(401, "User not found.."))
        }

        // On Success

        return res.status(200).json({
            success: true,
            msg: "Successfully deleted user.."
        })

    } catch (error) {
        return next(createHttpError(500, "Internal error"))
    }
}

// VIEW_ADMIN_PROFILE

const VIEW_ADMIN_PROFILE = async (req, res, next) => {
    try {

        const ADMIN_ID = req.user;

        const admin = await adminModel.findById(ADMIN_ID, { updatedAt: 0, accessToken: 0, __v: 0 });

        if (!admin) {
            return next(createHttpError(401, "Invalid  Id"))
        }

        res.status(200).json(admin)
    } catch (error) {
        return next(createHttpError(401, "Error during fetching admin profile..3"))
    }
}


const CHANGE_ADMIN_PASSWORD = async (req, res, next) => {
    try {
        const { error, value } = CHANGE_ADMIN_PASSWORD_SCHEMA_VALIDATION.validate(req.body);
        const reqDATA = value;
        const ADMIN_ID = req?.user;

        if (reqDATA.password === reqDATA.newPassword) {
            return next(createHttpError(401, "Invalid request.."));
        }


        if (!ADMIN_ID) {
            return next(createHttpError(406, "Invalid request.."))
        }



        if (error) {
            return next(createHttpError(401, error?.details.at(0).message))
        }


        // CHCEK PSWD IS SAME OR NOT  IF SAME RETURN 

        const Admin = await adminModel.findById(ADMIN_ID)

        if (!Admin) {
            return next(createHttpError(406, "Invalid request.."))
        }

        // Compare old password 

        const isOldPasswordValid = await bcrypt.compare(reqDATA.password, Admin.password)

        if (!isOldPasswordValid) {
            return next(createHttpError(401, "Inavlid password"))
        }


        // On Success of Password match

        const newPasswordHash = await bcrypt.hash(reqDATA.newPassword, 10)

        Admin.password = newPasswordHash;

        await Admin.save();

        console.log("Password changed successfully...");
        return res.status(201).json({ success: true, msg: "Password change successfully" })
    } catch (error) {
        return next(createHttpError(500, `Error from CHANGE PSWD${error} `))
    }
}

const SEARCH_USERS = async (req, res, next) => {
    try {
        const searchKey = req?.query?.s;

        if (!searchKey) {
            return next(createHttpError(401, "Invalid requests.."))
        }

        const mobileNumberRegex = /^(?!(\d)\1{9})[6789]\d{9}$/;

        let searchTypeMobileNumber = mobileNumberRegex.test(searchKey);

        const searchQuery = searchTypeMobileNumber ? { mobileNum: searchKey } : { fullName: new RegExp(searchKey, 'i') }

        if (searchTypeMobileNumber) {
            const users = await userModel.findOne(searchQuery, { accessToken: 0, role: 0, otp: 0, updatedAt: 0, __v: 0, id: 0 });

            if (!users) {
                return next(createHttpError(401, `Oops no user found with ${searchKey}`))
            }

            const prettyDATA = [users]
            return res.status(200).json(prettyDATA)
        }

        // if search key is user name
        const users = await userModel.find(searchQuery, { accessToken: 0, role: 0, otp: 0, updatedAt: 0, __v: 0, id: 0 });
        if (!users) {
            return next(createHttpError(401, `Oops no user found with ${searchKey}`))
        }

        return res.status(200).json(users)


    } catch (error) {
        return next(createHttpError(401, `Internal error ${error}`))
    }
}


const VALIDATE_SEARCH_SCHEMA = Joi.object(
    {
        searchKey: Joi.string().min(5).max(20).required()
    })

const SEARCH_ORDERS = async (req, res, next) => {
    try {

        const { error, value } = VALIDATE_SEARCH_SCHEMA.validate(req.query)
        if (error) {
            return next(createHttpError(400, "Invalid request"))
        }
        const reqDATA = value;


        const Order = await orderModel.findOne({ order_id: reqDATA.searchKey },
            { updatedAt: 0, __v: 0, order_id: 0, isPackage: 0, payment_method: 0, products: 0, total_amount: 0, createdAt: 0 });

        if (!Order) {
            return next(createHttpError(401, "Invalid order id."))
        }

        const prettyDATA = {
            success: true,
            ...Order._doc
        }

        return res.json(prettyDATA)

    } catch (error) {
        return next(createHttpError(401, `Internal errors ${error.message}`))
    }
}

export {
    RegisterAdmin,
    LoginAdmin,
    GET_ALL_USERS,
    GET_SINGLE_USERS,
    DELETE_SINGLE_USERS,
    VIEW_ADMIN_PROFILE,
    CHANGE_ADMIN_PASSWORD,
    SEARCH_USERS,
    SEARCH_ORDERS
}


