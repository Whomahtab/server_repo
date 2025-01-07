import express, { Router } from "express";
import { CheckAvailability, setAvailability } from '../AvailibiltyCheck/areaPinController.js'
import { RegisterUser, UpdateUser, verifyOTP } from "../Users/userController.js";
import UserAuth from "../middleware/Auth.js";
import rateLimit from "express-rate-limit";
import { GET_ALL_ORDERS_BY_USER_ID, GET_SINGLE_ORDERS, newOrder } from "../Orders/orderController.js";
import { GET_ALL_PACKAGE } from "../Package/PackageController.js";
// End_OF_Admins_Controller
const limitOTP = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
})

// 
//  LIMIT OTP VERIFICATION 
//  WITH_IN 2 MINUTES 
// USER CAN Verify or generate 4 OTP within given time
// 
// 

// Router...
const Route = express.Router();

// Check status through PIN CODE
Route.post('/check-status', CheckAvailability)

// Set New area PIN code via Admin..
Route.post('/checkAvail', setAvailability)


// USERS....

//register user and send OTP..
Route.post('/users/otp', limitOTP, RegisterUser);

// Verify-user-With-Otp..
Route.post('/user/verify-otp', verifyOTP);
// Route.post('/user/verify-otp', limiter, verifyOTP);

// Update user Profile details
Route.patch('/user/update/:userID', UserAuth, UpdateUser);


//  Create New Orders for users
Route.post('/user/newOrder', newOrder)

// SHOW PACKAGES
Route.get('/packages', GET_ALL_PACKAGE)
Route.get('/order/:USER_ID', GET_ALL_ORDERS_BY_USER_ID)
Route.get('/order/order', GET_SINGLE_ORDERS)


export default Route;
