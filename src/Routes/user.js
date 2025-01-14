import express, { Router } from "express";
import { RegisterUser, UpdateUser, verifyOTP } from "../Users/userController.js";
import UserAuth from "../middleware/Auth.js";
import rateLimit from "express-rate-limit";
import { GET_ALL_ORDERS_BY_USER_ID, GET_SINGLE_ORDERS, newOrder } from "../Orders/orderController.js";
import { GET_ALL_PACKAGE } from "../Package/PackageController.js";
import { CHECK_AREA_STATUS } from "../AreaZone/areaZoneController.js";
import createHttpError from "http-errors";
import authUser from "../middleware/authUser.js";


const limitOTP = rateLimit({
    windowMs: 60 * 60 * 1000, //1hr
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
})


// Router for USERS...
const Route = express.Router();

//register user and send OTP..
Route.post('/users/otp', limitOTP, RegisterUser);

// Verify-user-With-Otp..
Route.post('/user/verify-otp', limitOTP, verifyOTP);
// Route.post('/user/verify-otp', limiter, verifyOTP);

// Update user Profile details
Route.patch('/user/update/:userID', authUser, UpdateUser);

//  Create New Orders for users
Route.post('/user/newOrder', authUser, newOrder)

// SHOW PACKAGES
Route.get('/packages', GET_ALL_PACKAGE)
Route.get('/order/:USER_ID', authUser, GET_ALL_ORDERS_BY_USER_ID)
Route.get('/order/:ORDER_ID', authUser, GET_SINGLE_ORDERS)

Route.get('/availability-check', CHECK_AREA_STATUS)

Route.get('/user-protected', authUser, (req, res, next) => {
    try {
        return res.status(200).json({ msg: 'user authentication successfully..' })
    } catch (error) {
        return next(createHttpError(401, `Internal err.${error}`))
    }
})


export default Route;
