import createHttpError from 'http-errors';
import areaPinAvailabilityModel from './areaPinModel.js';
import Joi from 'joi';

// Schema For CheckAvailability
let CheckAvailabilityValidateSchema = Joi.object({
    areaPin: Joi.string().required(),
})

// Schema For Yup Area pin code 
let areaPinSchema = Joi.object({
    areaPin: Joi.string().required(),
    isAvailable: Joi.boolean().required(),
    role: Joi.string(),
})



// ----------------------------
const CheckAvailability = async (req, res, next) => {
    const { areaPin } = req.body;
    // validate Body...
    const { error, value } = CheckAvailabilityValidateSchema.validate(req.body);


    if (error) {
        next(createHttpError(401, 'Please fill the form carefully'))
        return;
    }
    // On Success

    const getPinCode = await areaPinAvailabilityModel.findOne({ areaPin: value.areaPin })
    if (!getPinCode) {
        return next(createHttpError(401, "Pin Code Not found..."))
    }

    return res.status(200).json({
        success: true,
        msg: "Pin code Found.."
    })


    // const getPinCode = await areaPinAvailabilityModel.findOne({ value.areaPin })
}

const setAvailability = async (req, res, next) => {

    // validate Body...
    const { error, value } = areaPinSchema.validate(req.body);
    if (error) {
        console.log(`Error Exists ${error}`);
        next(createHttpError(400, 'Please Enter valid Pin Code..'))
        return;
    }

    // Check for already exists
    const isAreaPinExists = await areaPinAvailabilityModel.findOne({ areaPin: value.areaPin })
    if (isAreaPinExists) {
        next(createHttpError(400, "Already Pin Code Exists.."))
        return;
    }

    // ON SUCCESS...
    const areaPinStore = await areaPinAvailabilityModel.create(
        {
            areaPin: value.areaPin,
            isAvailable: value.isAvailable,
            role: value.admin,
        }
    )

    if (areaPinStore) {
        return res.json({ success: true, statusCode: 201, areaPinStore })
    }


}

export { CheckAvailability, setAvailability }