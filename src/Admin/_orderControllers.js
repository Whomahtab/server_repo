// import createHttpError from "http-errors";
// import orderModel from "../Orders/orderModel.js"


// const GET_ALL_ORDERS = async (req, res, next) => {
//     const orders = await orderModel.find().select("-updatedAt  -__v");

//     if (!orders) {
//         return next(createHttpError(401, "No Orders.."))
//     }

//     res.json(orders)
// }



// export { GET_ALL_ORDERS }