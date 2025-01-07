import express from "express";

import { CHANGE_ADMIN_PASSWORD, DELETE_SINGLE_USERS, GET_ALL_USERS, GET_SINGLE_USERS, LoginAdmin, RegisterAdmin, SEARCH_ORDERS, SEARCH_USERS, VIEW_ADMIN_PROFILE } from "../Admin/adminController.js";
import { Product } from "../Products/productController.js";
import { ADD_NEW_PACKAGE, DELETE_SINGLE_PACKAGE, GET_ALL_PACKAGE, GET_SINGLE_PACKAGE, UPDATE_PACKAGE } from "../Package/PackageController.js";

import { GET_ALL_ORDERS, GET_ALL_ORDERS_BY_USER_ID, GET_SINGLE_ORDERS } from "../Orders/orderController.js";

import { DELETE_EMPLOYEE, EMPLOYEE_LIST, GET_SINGLE_EMPLOYEE, NEW_EMPLOYEE } from "../Employee/EmployeeController.js";

// AUTH..
import isAdmin from "../middleware/isAdmin.js";

const AdminRoute = express.Router();


// Routes For Admin..
AdminRoute.post('/register', RegisterAdmin)
AdminRoute.post('/login', LoginAdmin)

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
AdminRoute.get('/order/', GET_ALL_ORDERS)
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


// SERACH USERS
AdminRoute.get('/search-user', SEARCH_USERS)
AdminRoute.get('/search-orders', SEARCH_ORDERS)


export default AdminRoute