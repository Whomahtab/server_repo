import createHttpError from "http-errors";


// Set New Product By Admins
const Product = async (req, res, next) => {
    try {
        res.json({ msg: "Authenticated Successfully.." });

    } catch (error) {
        next(createHttpError(401, `Error Occurred${error.message}`))
    }
}


export { Product }