import createHttpError from "http-errors";
import Joi from "joi";
import userModel from './userModel.js'
import otpModel from './otpSchema.js'
import userRegisterSchema from "./userRegisterValidateSchema.js";
import jwt from 'jsonwebtoken';
import { config } from '../config/_config.js'
import sendOTP from "../utils/sendOTP.js";

const RegisterUserValidateSchema = Joi.object({
    mobileNum: Joi.string().length(10).pattern(/^[0-9]+$/).required()
});


// Register User with Mobile Number..
const RegisterUser = async (req, res, next) => {
    try {
        const { mobileNum } = req.body;

        const { error, reqData } = RegisterUserValidateSchema.validate(req.body)

        if (error) {
            next(createHttpError(400, "Please fill the form carefully"))
            return
        }

        // On Success...
        //   Dummy OTP forUser verification..
        function generateOTP() {
            const newOtp = Math.floor(1000 + Math.random() * 9000);
            return newOtp.toString()
        }

        const newOtp = generateOTP()

        // SEND OTP THROUGH  SMS_API
        const OTP = await sendOTP(newOtp, mobileNum)

        console.log("OTP_DB", OTP);

        if (OTP.return == false) {
            return next(createHttpError(401, "SMS_API_ERROR"))
        }
        // const newOtp = await bcrypt.hash(generateOTP(), 10)

        const isUserExists = await userModel.findOne({ mobileNum: mobileNum })

        if (isUserExists) {
            try {
                // generate Otp for Existing user ..
                const newUserOtp = await otpModel.create({ otp: newOtp, userId: isUserExists.id, isVerified: false })
                isUserExists.otp = newUserOtp.id;
                await isUserExists.save();

                return res.status(200).json({
                    success: true,
                    // id: newUserOtp.id,
                });
            } catch (error) {
                return next(createHttpError(401, "Something went wrong.."))
            }
        }
        // for new User store user details and generate OTP..

        const _newOtp = await otpModel.create({ otp: newOtp, userId: null, isVerified: false })
        const user = await userModel.create({ mobileNum, otp: _newOtp.id });
        _newOtp.userId = user.id;
        await _newOtp.save()


        // For New Users send  Response..
        return res.json(
            {
                success: true,
                // id: _newOtp.id,
            }
        )

    } catch (error) {
        console.log(error);
        next(createHttpError(401, "Invalid Entry..."))
        return
    }



    //  insert user Mobile number into Db..
    //  Generate OTP using MAth obj
    //  store otp into db 
    // if all is good return success


}



const UpdateUser = async (req, res, next) => {
    // isVerified => if user all data Like (Name,age,gender,address, areaPin, role)

    const userID = req.params.userID;
    if (!userID) {
        next(createHttpError(401, "Please fill the form carefully.."))
    }


    const { fullName, age, gender, address, role, areaPin } = req.body;

    const { error, value } = userRegisterSchema.validate(req.body)

    if (error) {
        next(createHttpError(401, "Please fill the form craefully.."))
    }

    if (!userID) {
        next(createHttpError(401, "User Id Required.."))
    }

    try {
        const isExistingUser = await userModel.findById(userID)
        if (!isExistingUser) {
            next(createHttpError(401, "User Id Not found...."))
        }

        // Update all the details..
        isExistingUser.fullName = fullName;
        isExistingUser.age = age;
        isExistingUser.gender = gender;
        isExistingUser.address = address;
        isExistingUser.role = role;
        isExistingUser.areaPin = areaPin;

        if (isExistingUser.fullName &&
            isExistingUser.age &&
            isExistingUser.gender &&
            isExistingUser.address &&
            isExistingUser.role &&
            isExistingUser.areaPin
        ) {
            isExistingUser.isVerified = true;
        }

        await isExistingUser.save();


        // Temp..
        res.json({
            success: "true",
            msg: "Successfully updated..",
            // user: isExistingUser

        })
    } catch (error) {
        next(createHttpError(401, `${error.message}`))
    }

}



// Validate SChema for OTP

const otpValidateSchema = Joi.object({
    mobileNum: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    clientOtp: Joi.string().length(4).required(),
});




const verifyOTP = async (req, res, next) => {
    /*
     1 get mobile number and OTP from clint and validate it.
     2 check for mobile isMobileNumber new ..
     3   
    */
    try {
        // Validate request body
        const { error, value } = otpValidateSchema.validate(req.body);
        if (error) {
            return next(createHttpError(401, error?.details[0]?.message));
        }

        const { mobileNum, clientOtp } = value;
        const user = await userModel.findOne({ mobileNum });

        if (!user) {
            return next(createHttpError(401, "Unauthorized..1"))
        }

        // extract Otp Id from user Db..
        const userOtp = user.otp;
        if (!userOtp) {
            return next(createHttpError(401, "Invalid otp..1"))
        }

        const Otp = await otpModel.findById(userOtp);

        if (!Otp) {
            return next(createHttpError(401, "invalid Otp.2"))
        }

        // if OTP is already use or Verified return false..
        if (Otp.isVerified) {
            return next(createHttpError(400, "Please resend the otp."))
        }
        // validate client and DB OTP

        console.log("LOG OTP=>", clientOtp, Otp.otp);

        if (clientOtp !== Otp.otp) {
            return next(createHttpError(400, "Invalid Otp..3"))
        }

        // ON Success..


        // // send auth User Id to frontend for Verification
        // // along with simple response we will.. send Token for AUTH..

        const token = jwt.sign({ id: user.id, role: user.role }, config.USER_SECRET)
        user.accessToken = token;

        // validate otp in the OTP_DB for validation
        Otp.isVerified = true;

        await Otp.save()

        await user.save();
        // Save Token inside Db Too..

        return res.status(200).json({
            success: "true",
            msg: "OTP verified successfully",
            accessToken: token
        });

        // On Success 
        // Delete OTP FROM DB TO..

    } catch (error) {
        console.error(error.message);
        next(createHttpError(500, `error occurred ${error}`));
    }
};



export { RegisterUser, UpdateUser, verifyOTP }




