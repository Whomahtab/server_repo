import Joi from "joi";
import PackageModel from "./PackageModel.js";
import createHttpError from "http-errors";
import generateOrderID from "../Counter/counterController.js";
import { nanoid } from "nanoid";

// body Validate..
const newPkgValidateSchema = Joi.object({
    // pkg_id: Joi.string().max(50).required(),
    name: Joi.string().min(3).max(100).required(),
    textContent: Joi.array(),
    description: Joi.string().min(3).max(500).required(),
    packageListTextItems: Joi.array().required(),
    utensils: Joi.array()
        .items(
            Joi.object({
                utensil_id: Joi.string().required(),
                name: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
            })
        ),
    capacity: Joi.string().required(),
    price: Joi.number().required(),
    policy: Joi.string(),
    status: Joi.string(),
    notes: Joi.string()
})

const updatePKG_VALIDATE_SCHEMA = Joi.object({
    name: Joi.string().min(3).max(100),
    textContent: Joi.array(),
    description: Joi.string().min(3).max(500),
    packageListTextItems: Joi.array().required(),
    utensils: Joi.array()
        .items(
            Joi.object({
                utensil_id: Joi.string().required(),
                name: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
            })
        ),
    capacity: Joi.string(),
    price: Joi.number(),
    policy: Joi.string(),
    status: Joi.string(),
    notes: Joi.string()
})

// The package data will be inserted through the Admin Only.
const ADD_NEW_PACKAGE = async (req, res, next) => {
    try {
        const { error, value } = newPkgValidateSchema.validate(req.body);

        if (error) {
            console.log(error);
            return next(createHttpError(401, error?.details?.message))
        }

        let reqData = value;


        // Check for Package already Exists or Not..
        const isPackageExists = await PackageModel.findOne({ name: reqData.name });
        console.log(isPackageExists);
        if (isPackageExists) {
            return next(createHttpError(401, "Package name should be different"))
        }

        // check if utensils present or not

        // On Success add data to the database..
        const PackageID = await generateOrderID("packageID", "DVYMPKG")

        if (!PackageID) {
            return next(createHttpError(401, "Can't able to generate Package ID."))
        }
        if (!reqData.price) {
            return next(createHttpError(401, "Package price cannot be 0 or nul"))
        }

        const prettyData = {
            id: nanoid(),
            pkg_id: PackageID,
            name: reqData.name,
            description: reqData.description,
            packageListTextItems: reqData.packageListTextItems,
            utensils: reqData.utensils ? reqData.utensils : [],
            capacity: reqData.capacity,
            price: reqData.price,
            policy: reqData.policy,
            status: reqData.status,
            notes: reqData.notes

        }

        const insertPkg = await PackageModel.create(prettyData);

        if (!insertPkg) {
            return next(createHttpError(401, "Can't able to Create New Package.."))
        }

        // Send success response to the client end..

        return res.status(201).json({ success: true, pkg_Id: prettyData.pkg_id })


    } catch (error) {
        return next(createHttpError(401, `ERR=>${error.message}`))
    }
}



const UPDATE_PACKAGE = async (req, res, next) => {
    try {
        const PKG_ID = req.params?.PKG_ID;

        if (!PKG_ID) {
            next(createHttpError(401, "Invalid Package Id."))
        }
        // validate req body
        const { error, value } = newPkgValidateSchema.validate(req.body);
        if (error) {
            let errMsg = error?.details.at(0)?.message
            return next(createHttpError(401, errMsg))
        }

        const reqData = value;
        console.log("PKG_ID_CLIENT-,Before", PKG_ID);

        // ON Success..
        const prettyData = {
            // pkg_id: reqData.pkg_id,
            name: reqData?.name,
            description: reqData?.description,
            packageListTextItems: reqData?.packageListTextItems,
            utensils: reqData?.utensils?.map(item => ({
                utensil_id: item?.utensil_id,
                name: item?.name,
                quantity: item?.quantity,
            })),
            capacity: reqData?.capacity,
            price: reqData?.price,
            policy: reqData?.policy,
            notes: reqData?.notes
        }


        const updatePKG = await PackageModel.findOneAndUpdate({ id: PKG_ID }, prettyData)

        if (!updatePKG) {
            return next(createHttpError(401, "can not able to Update.."))
        }
        // ON SUCCESS

        res.json({
            success: true,
            msg: "Updated Successfully.."
        })

    } catch (error) {
        return next(createHttpError(401, `${error.message}`))
    }
}


const DELETE_SINGLE_PACKAGE = async (req, res, next) => {
    try {
        // get params 
        // const pkgID = req.params;
        // console.log(req.params.Pkg_Id);
        // check params in the db
        const PKG_ID = req?.params?.PKG_ID;
        if (!PKG_ID) {
            return next(createHttpError(401, "Package ID not found.."))
        }

        // check in db too..

        const getPkg = await PackageModel.findOneAndDelete({ id: PKG_ID });

        if (!getPkg) {
            return next(createHttpError(401, "There is no package with this ID"))
        }

        // On Success
        return res.json({
            success: true,
            msg: "Successfully Deleted.."
        })

    } catch (error) {
        return next(createHttpError(401, "Something went wrong During package deletion.."))
    }
}

// Add Sorting Also..
const GET_ALL_PACKAGE = async (req, res, next) => {
    try {
        const Package = await PackageModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0, _id: 0 });

        if (!Package) {
            return next(createHttpError(401, "Something went wrong.."))
        }

        return res.json(Package)
    } catch (error) {
        next(createHttpError(401, "Not found.."))
        return
    }
}


const GET_SINGLE_PACKAGE = async (req, res, next) => {
    console.log("called..");
    const PKG_ID = req?.params?.PKG_ID.trim();

    console.log(PKG_ID);

    if (!PKG_ID) {
        return next(createHttpError(401, "There is no package with this id."))
    }

    const isPackageExists = await PackageModel.findOne({ id: PKG_ID }, { createdAt: 0, updatedAt: 0, __v: 0, _id: 0 })

    if (!isPackageExists) {
        return next(createHttpError(401, "Invalid package id."))
    }

    res.json(isPackageExists)
}

export {
    ADD_NEW_PACKAGE,
    DELETE_SINGLE_PACKAGE,
    UPDATE_PACKAGE,
    GET_ALL_PACKAGE,
    GET_SINGLE_PACKAGE
};