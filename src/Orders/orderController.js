import createHttpError from "http-errors";
import Joi from "joi";
import orderModel from "./orderModel.js";
import userModel from '../Users/userModel.js';
import PackageModel from "../Package/PackageModel.js";
import generateOrderID from "../Counter/counterController.js";
// import { GET_ALL_ORDERS } from "../Admin/orderControllers.js";

const ORDER_SCHEMA_VALIDATION = Joi.object(
    {
        customer_id: Joi.string()
            .required()
            .messages({
                'string.base': 'Customer ID must be a string.',
                'any.required': 'Customer ID is required.',
            }),
        isPackage: Joi.boolean().required(),
        products: Joi.array()
            .required()
            .messages({
                'array.base': 'Products must be an array.',
                'any.required': 'Products are required.',
            }),
        total_price: Joi.number()
            .required()
            .messages({
                'number.base': 'Total price must be a number.',
                'any.required': 'Total price is required.',
            }),
        payment_method: Joi.string()
            .required()
            .messages({
                'string.base': 'Payment method must be a string.',
                'any.required': 'Payment method is required.',
            }),
    }
)

const newOrder = async (req, res, next) => {
    let total_Price;
    let order_Products;
    try {
        const { error, value } = ORDER_SCHEMA_VALIDATION.validate(req.body)

        if (error) {

            return next(createHttpError(401, `${error?.details?.messages}`))
        }
        const reqDATA = value;

        const user = await userModel.findById(reqDATA.customer_id);

        if (!user) {
            return next(createHttpError(401, "Error during order creation.."))
        }

        // Check order has isPackage or Product based On that we Prepare New Orders..
        if (reqDATA.isPackage) {
            try {
                const productDetails = await Promise.all(reqDATA.products.map(async (product) => {
                    const productData = await PackageModel.findById(product.product_id);

                    return {
                        ...product,
                        price: productData.price,
                        quantity: product.quantity,
                    };
                }));

                total_Price = productDetails.reduce((total, product) => {
                    return total + (product.price * product.quantity);
                }, 0);

                order_Products = await Promise.all(productDetails.map(async (product, i) => {
                    if (product.quantity <= 0) {
                        return next(createHttpError(401, "Unauthorize"));
                    }

                    if (product.price <= 0) {
                        return next(createHttpError(401, "Unauthorize"));
                    }

                    return {
                        productId: product.product_id,
                        quantity: product.quantity,
                        price: product.price,
                    };
                }));

                // console.log(productDetails);
            } catch (error) {
                return next(createHttpError(401, error.message));
            }
        }

        // Generate new OrderID
        const OrderID = await generateOrderID("orderID", "DVYM")
        // const newOrder = await orderModel.find({ order_id: OrderID });

        if (!OrderID) {
            return next(createHttpError(401, "Error during fetching orderModel.."))
        }

        // For product will write in this block..
        const PRETTY_ORDER_DATA =
        {
            order_id: OrderID,
            customer_id: reqDATA.customer_id,
            isPackage: reqDATA.isPackage,
            total_amount: total_Price,
            payment_method: reqDATA.payment_method,
            products: order_Products
        }

        const makeNewOrder = await orderModel.create(PRETTY_ORDER_DATA)

        if (!makeNewOrder) {
            return next(createHttpError(401, "Error creating order"))
        }

        res.json(makeNewOrder)
    } catch (error) {
        return next(createHttpError(401, `${error}`))
    }
}

const GET_ALL_ORDERS_BY_USER_ID = async (req, res, next) => {
    try {
        const USER_ID = req?.params?.USER_ID;

        if (!USER_ID) {
            return next(createHttpError(401, "Invalid request"))
        }

        // get all the orders from db of Customers 

        const orders = await orderModel.find({ customer_id: USER_ID }, { _id: 0, __v: 0, updatedAt: 0, order_date: 0 })

        if (!orders || orders.length <= 0) {
            return next(createHttpError(401, "Invalid request"))
        }

        // on success



        return res.status(200).json(orders[0]);


    } catch (error) {
        return next(createHttpError(401, `Internal error ${error.message}`))
    }
}

const GET_SINGLE_ORDERS = async (req, res, next) => {
    try {
        const ORDER_ID = req.params.ORDER_ID;

        if (!ORDER_ID) {
            return next(createHttpError(401, "Invalid Order Id"))
        }

        const order = await orderModel.findOne({ _id: ORDER_ID }, { __v: 0, _id: 0, updatedAt: 0 })

        res.status(200).json(order)

    } catch (error) {
        return next(createHttpError(401, "Something went wrong during fetching Orders from DB"))
    }
}

// /items?page=${page}&limit=${limit}

const ALL_ORDER_SCHEMA_VALIDATION = Joi.object({
    page: Joi.string().min(1).required(),
    limit: Joi.string(),
})

const GET_ALL_ORDERS = async (req, res, next) => {
    const { error, value } = ALL_ORDER_SCHEMA_VALIDATION.validate(req.query);

    if (error) {
        return next(createHttpError(401, "Invalid request."))
    }
    // assign req body to reqDATA 
    const reqDATA = value;

    const page = parseInt(reqDATA.page) || 1;
    const limit = parseInt(reqDATA.limit) || 10;


    const skip = (page - 1) * limit;

    if (skip < 0) {
        return next(createHttpError(401, "Invalid request.."))
    }

    const orders = await orderModel.find().select("-updatedAt  -__v").limit(limit).skip(skip);

    if (!orders) {
        return next(createHttpError(401, "No Orders.."))
    }

    res.json(orders)
}



export { newOrder, GET_ALL_ORDERS_BY_USER_ID, GET_SINGLE_ORDERS, GET_ALL_ORDERS }