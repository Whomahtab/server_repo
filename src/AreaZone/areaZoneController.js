import createHttpError from 'http-errors';
import Joi from 'joi';
import AreaZoneModel from './areaZoneModel.js';
import formatDateForMongo from '../utils/formatDateForMongo.js';
// regex for areaPinCode
const areaPinValidateRGX = /^[1-9]{1}[0-9]{5}$/;
import moment from 'moment';


const DATE_REGEX = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
import dayjs from 'dayjs';

const formateToISODate = (str) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(Date.UTC(year, month - 1, day))
}

function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

//Area_zone_validate_schema
const NEW__AREA__ZONE__VALIDATE__SCHEMA = Joi.object({
    state: Joi.string().trim().min(3).max(20).required().messages({
        'string.length': 'oops! Invalid entry',
        'string.empty': 'state must be a valid string',
        'string.base': 'State must be a string',
        'any.required': 'State is required'
    }),
    district: Joi.string().trim().min(3).max(25).required()
        .messages({
            'string.empty': 'district must be a valid string',
            'string.base': 'District must be a string',
            'any.required': 'District is required'
        }),
    areaPinCode: Joi.string().regex(areaPinValidateRGX).required()
        .messages({
            'string.empty': "Area Pincode must be a valid string",
            'string.base': 'Area Pincode must be a string',
            'string.length': 'Area Pincode must be exactly 6 digits',
            'string.pattern.base': 'Area Pincode must start with a non-zero digit and be 6 digits long',
            'any.required': 'Area Pincode is required'
        }),
    startDate: Joi.string().trim().pattern(DATE_REGEX).required().messages({
        'string.empty': "date can't be empty",
        'date.base': 'Start Date must be a valid date',
        'any.required': 'Start Date is required',
        'string.pattern.base': 'Start Date must be a valid date',
    }),
    endDate: Joi.string().trim().pattern(DATE_REGEX).required().messages({
        'string.empty': "date can't be empty",
        'date.base': 'End Date must be a valid date',
        'any.required': 'End Date is required',
        'string.pattern.base': 'End Date must be a valid date',
    }),
    isAvailable: Joi.boolean().required().messages({
        'boolean.empty': 'isAvailable must be a valid string',
        'boolean.base': 'isAvailable must be a valid string',
        'boolean.required': 'isAvailable must be a valid string'
    }),
})


const GET__AREA__ZONE__VALIDATE__SCHEMA = Joi.object({
    state: Joi.string().trim().min(3).max(20).messages({
        'string.length': 'oops! Invalid entry',
        'string.empty': 'state must be a valid string',
        'string.base': 'State must be a string',
        'any.required': 'State is required'
    }),
    district: Joi.string().trim().min(3).max(25)
        .messages({
            'string.empty': 'district must be a valid string',
            'string.base': 'District must be a string',
            'any.required': 'District is required'
        }),
    areaPinCode: Joi.string().regex(areaPinValidateRGX).required()
        .messages({
            'string.empty': "Area Pincode must be a valid string",
            'string.base': 'Area Pincode must be a string',
            'string.length': 'Area Pincode must be exactly 6 digits',
            'string.pattern.base': 'Area Pincode must start with a non-zero digit and be 6 digits long',
            'any.required': 'Area Pincode is required'
        }),
    startDate: Joi.string().trim().pattern(DATE_REGEX).messages({
        'string.empty': "date can't be empty",
        'date.base': 'Start Date must be a valid date',
        'any.required': 'Start Date is required',
        'string.pattern.base': 'Start Date must be a valid date',
    }),
    endDate: Joi.string().trim().pattern(DATE_REGEX).messages({
        'string.empty': "date can't be empty",
        'date.base': 'End Date must be a valid date',
        'any.required': 'End Date is required',
        'string.pattern.base': 'End Date must be a valid date',
    }),
})

const SET_NEW_AREA_ZONE = async (req, res, next) => {
    try {
        const { error, value } = NEW__AREA__ZONE__VALIDATE__SCHEMA.validate(req.body)
        if (error) {
            return next(createHttpError(error?.details[0].message))
        }

        const reqDATA = value;
        const start = formateToISODate(reqDATA?.startDate)
        const end = formateToISODate(reqDATA?.endDate)

        const query = {
            areaPinCode: reqDATA?.areaPinCode,
            state: reqDATA?.state,
            district: reqDATA?.district,
            startDate: start,
            endDate: end,
        }

        const AreaZone = await AreaZoneModel.find(query);

        if (AreaZone.length > 0) {
            return next(createHttpError(401, "Area is already registered "))
        }

        // DATA 
        const prettyDATA = {
            areaPinCode: reqDATA?.areaPinCode,
            state: reqDATA?.state,
            district: reqDATA?.district,
            startDate: start,
            endDate: end,
            "isAvailable": reqDATA?.isAvailable
        }

        const newAreaZone = await AreaZoneModel.create(prettyDATA)

        if (!newAreaZone) {
            return next(createHttpError(401, "invalid request."))
        }


        res.status(201).json({ success: true, msg: "Successfully new area zone is created." })
    } catch (error) {
        return next(createHttpError(400, `Invalid requests || ${error}`))
    }
}

const UPDATE_AREA_ZONE = async (req, res, next) => {
    try {
        const AREA_ZONE_ID = req?.params?.AREA_ZONE_ID;

        if (!AREA_ZONE_ID) {
            return next(createHttpError(400, "invalid request."))
        }
        const { error, value } = NEW__AREA__ZONE__VALIDATE__SCHEMA.validate(req.body);
        if (error) {
            return next(createHttpError(401, error?.details.at(0).message))
        }

        const reqDATA = value;

        const isAreaExist = await AreaZoneModel.findById(AREA_ZONE_ID);

        if (!isAreaExist) {
            return next(createHttpError(400, "oops Invalid request."))
        }

        const prettyDATA = {
            state: reqDATA?.state,
            district: reqDATA?.district,
            areaPinCode: reqDATA?.areaPinCode,
            startDate: formatDateForMongo(reqDATA?.startDate),
            endDate: formatDateForMongo(reqDATA?.endDate),
            isAvailable: reqDATA?.isAvailable,
        }


        const update_AreaZone = await AreaZoneModel.findByIdAndUpdate(AREA_ZONE_ID, prettyDATA)

        if (!update_AreaZone) {
            return next(createHttpError(401, "Internal error.."))
        }

        return res.status(201).json({
            success: true,
            msg: "Successfully updated area zones"
        })

    } catch (error) {
        return next(createHttpError(401, `Internal error ${error?.message}`))
    }
}

const GET_ALL_AREA_ZONES_SCHEMA_VALIDATION = Joi.object({
    page: Joi.string().min(1).required(),
    limit: Joi.string().min(1),
})

const GET_ALL_AREA_ZONES = async (req, res, next) => {
    try {
        const { error, value } = GET_ALL_AREA_ZONES_SCHEMA_VALIDATION.validate(req.query);

        if (error) {
            return next(createHttpError(401, error?.details.at(0).message))
        }

        const reqDATA = value;

        const page = parseInt(reqDATA.page) || 1;
        const limit = parseInt(reqDATA.limit) || 10;

        const skip = (page - 1) * limit;

        if (skip < 0) {
            return next(createHttpError(401, "Invalid request.."))
        }

        const areaZone = await AreaZoneModel.find({},
            { __v: 0, createdAt: 0, updatedAt: 0 }).limit(limit).skip(skip);


        if (!areaZone.length) {
            return next(createHttpError(401, "--"))
        }


        return res.status(200).json({ success: true, responseData: areaZone })
    } catch (error) {
        return next(createHttpError(401, "Internal Errors"))
    }
}

const GET_SINGLE_AREA_ZONE = async (req, res, next) => {
    try {
        const AREA_ZONE_ID = req?.params.AREA_ZONE_ID;
        if (!AREA_ZONE_ID) {
            return next(createHttpError(401, "Invalid Area ID"))
        }

        const AreaZone = await AreaZoneModel.findById(AREA_ZONE_ID, { createdAt: 0, updatedAt: 0, __v: 0 });

        if (!AreaZone) {
            return next(createHttpError(400, "Invalid requests"))
        }
        // On Success
        return res.json({ success: true, responseData: AreaZone })
    } catch (error) {
        return next(createHttpError(401, "Internal error"))
    }
}
const DELETE_AREA_ZONE = async (req, res, next) => {
    try {
        const AREA_ZONE_ID = req?.params?.AREA_ZONE_ID;

        if (!AREA_ZONE_ID) {
            return next(createHttpError(400, "invalid request"))
        }

        const AreaZone = await AreaZoneModel.findByIdAndDelete(AREA_ZONE_ID);
        if (!AreaZone) {
            return next(createHttpError(400, "invalid area zone id"))
        }
        // On Success
        return res.status(201).json({ success: true, msg: "Successfully deleted." })

    } catch (error) {
        return next(createHttpError(401, "Internal error"))
    }
}

const CHECK_AREA_STATUS = async (req, res, next) => {
    try {
        const { error, value } = GET__AREA__ZONE__VALIDATE__SCHEMA.validate(req.query);

        if (error) {
            return next(createHttpError(400, `${error?.details[0]?.message}`));
        }

        const { state, district, startDate, endDate, areaPinCode } = req.query;

        if (!state || !district || !areaPinCode) {
            return next(createHttpError(400, "Missing required query parameters"));
        }

        // build query
        let searchQuery = { state, district, areaPinCode };

        // const start = formateToISODate(startDate)
        // const end = formateToISODate(endDate)

        const start = new Date(startDate)
        const end = new Date(endDate)

        console.log(start, `\n`, end);

        // if (start && end && start > end) {
        //     return next(createHttpError(400, "Start date cannot be after end date"));
        // }

        // const isAvailable = await AreaZoneModel.find({
        //     startDate: { $gte: start },
        //     endDate: { $lte: end }
        // });


        // http://localhost:3000/api/availability-check?state=Uttar Pradesh&district=Prayagraj&areaPinCode=212503&startDate=01/01/2025&endDate=01/01/2025

        const isAvailable = await AreaZoneModel.find({
            $or: [
                {
                    startDate: { $gte: startDate, $lte: endDate }
                },
                {
                    endDate: { $gte: startDate, $lte: endDate }
                },
                {
                    startDate: { $lte: startDate },
                    endDate: { $gte: endDate }
                }
            ]
        });


        if (!isAvailable.length) {
            return next(createHttpError(404, "No results found"));
        }

        return res.status(200).json({
            success: true,
            msg: "Services are available in your zone",
            responseDATA: isAvailable  //
        });

    } catch (error) {
        return next(createHttpError(401, `ERR_0${error?.message}`))
    }
}


export {
    CHECK_AREA_STATUS,
    SET_NEW_AREA_ZONE,
    UPDATE_AREA_ZONE,
    GET_ALL_AREA_ZONES,
    DELETE_AREA_ZONE,
    GET_SINGLE_AREA_ZONE

}


// const startDate = '2025-01-01T00:00:00.000+00:00';

// // Example of querying with MongoDB:
// db.collection.find({
//   dateField: { $gte: new Date(startDate) }
// });