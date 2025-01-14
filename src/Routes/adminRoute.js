import express from "express";
import { CHANGE_ADMIN_PASSWORD, DELETE_SINGLE_USERS, GET_ALL_USERS, GET_SINGLE_USERS, LoginAdmin, RegisterAdmin, SEARCH_ORDERS, SEARCH_USERS, VIEW_ADMIN_PROFILE } from "../Admin/adminController.js";
import { Product } from "../Products/productController.js";
import { ADD_NEW_PACKAGE, DELETE_SINGLE_PACKAGE, GET_ALL_PACKAGE, GET_SINGLE_PACKAGE, UPDATE_PACKAGE } from "../Package/PackageController.js";
import rateLimit from "express-rate-limit";

import { GET_ALL_ORDERS, GET_ALL_ORDERS_BY_USER_ID, GET_SINGLE_ORDERS } from "../Orders/orderController.js";

import { DELETE_EMPLOYEE, EMPLOYEE_LIST, GET_SINGLE_EMPLOYEE, NEW_EMPLOYEE } from "../Employee/EmployeeController.js";

// AUTH..
import isAdmin from "../middleware/isAdmin.js";
import { DELETE_AREA_ZONE, GET_ALL_AREA_ZONES, GET_SINGLE_AREA_ZONE, SET_NEW_AREA_ZONE, UPDATE_AREA_ZONE } from "../AreaZone/areaZoneController.js";
const AdminRoute = express.Router();

// SET_RATE_LIMIT_FOR_ADMIN_LOGIN

const limitAdminLogin = rateLimit({
    windowMs: 600000,  // 10 minutes
    max: 10,
    message: '________👋________',
    // handler: (req, res, next, options) => {
    //     if (req.rateLimit.used === req.rateLimit.limit + 1) {
    //         // onLimitReached code here
    //         console.log(req.ip)
    //     }
    //     response.status(options.statusCode).send(`${options.message} ${req.ip}`)
    // },
})

// Routes For Admin..
AdminRoute.post('/register', RegisterAdmin)
AdminRoute.post('/login', limitAdminLogin, LoginAdmin)

// AUTH ADMIN THEN PROCEED FOR THE NEXT TASK..
AdminRoute.put('/add-new-product', isAdmin, Product)

// ADMIN=> ADD_NEW_PACKAGEs
AdminRoute.post('/package', isAdmin, ADD_NEW_PACKAGE)

// ADMIN=> Get All Packages..
AdminRoute.get('/package/', isAdmin, GET_ALL_PACKAGE)

// ADMIN=> Get SIngle Packages..
AdminRoute.get('/package/:PKG_ID', GET_SINGLE_PACKAGE)

// ADMIN=> Update Package..
AdminRoute.patch('/package/:PKG_ID', UPDATE_PACKAGE)
// AdminRoute.patch('/package/:PKG_ID', isAdmin, UPDATE_PACKAGE)

// ADMIN=> Delete Package..
AdminRoute.delete('/package/:PKG_ID', DELETE_SINGLE_PACKAGE)

// Orders  (ALl THE ROUTES Manage by ADMIN..)
AdminRoute.get('/order/', isAdmin, GET_ALL_ORDERS)
AdminRoute.get('/order/:ORDER_ID', isAdmin, GET_SINGLE_ORDERS)

// ADMIN ( SYSTEM_DATA_MODIFICATION => ADD =>DELETE => UPDATE)
AdminRoute.get('/users/', isAdmin, GET_ALL_USERS)
AdminRoute.get('/user/:USER_ID', isAdmin, GET_SINGLE_USERS)
AdminRoute.delete('/user/:USER_ID', isAdmin, DELETE_SINGLE_USERS)
AdminRoute.get('/profile', isAdmin, VIEW_ADMIN_PROFILE)
AdminRoute.post('/change-password', isAdmin, CHANGE_ADMIN_PASSWORD)

// EMPLOYEE api for admin..
AdminRoute.post('/new-employee', isAdmin, NEW_EMPLOYEE)
AdminRoute.get('/employee', isAdmin, EMPLOYEE_LIST)
AdminRoute.get('/employee/:EMP_ID', isAdmin, GET_SINGLE_EMPLOYEE)
AdminRoute.delete('/employee/:EMP_ID', isAdmin, DELETE_EMPLOYEE)

// SEARCH USERS
AdminRoute.get('/search-user', SEARCH_USERS)
AdminRoute.get('/search-orders', isAdmin, SEARCH_ORDERS)

//  AREA ZONES
AdminRoute.post('/areas-zone', SET_NEW_AREA_ZONE)
AdminRoute.get("/areas-zone", GET_ALL_AREA_ZONES)
AdminRoute.patch("/areas-zone/:AREA_ZONE_ID", UPDATE_AREA_ZONE)
AdminRoute.get("/areas-zone/:AREA_ZONE_ID", GET_SINGLE_AREA_ZONE)
AdminRoute.delete("/areas-zone/:AREA_ZONE_ID", DELETE_AREA_ZONE)

// Health-Check

// AdminRoute.get("/health", async (req, res, next) => {
//     try {
//         const healthCheck = {
//             uptime: process.uptime(),
//             message: 'Everything is okay..',
//             timestamp: Date.now()
//         };
//         res.status(200).json({
//             success: true,
//             msg: {
//                 ...healthCheck
//             }
//         })
//     } catch (error) {

//     }
// })
export default AdminRoute
