import createHttpError from "http-errors"
import Joi from "joi"
import { nanoid } from 'nanoid'
import EmployeeModel from "./EmployeeModel.js"
import bcrypt from "bcrypt"


const NEW_EMPLOYEE_SCHEMA_VALIDATION = Joi.object({
    fullName: Joi.string().trim().min(3).required(),
    gender: Joi.string().trim().min(4).required(),
    mobileNum: Joi.string().trim().length(10).required(),
    email: Joi.string().email().required(),
    dob: Joi.string().required(),
    pinCode: Joi.string().length(6).required(),
    address: Joi.string().trim().min(5).required()
})


const NEW_EMPLOYEE = async (req, res, next) => {
    try {

        const { error, value } = NEW_EMPLOYEE_SCHEMA_VALIDATION.validate(req.body)
        if (error) {
            // console.log(error);
            return next(createHttpError("400", error?.details[0].message))
        }
        const reqDATA = value
        const employeePassword = nanoid(10)
        const hashPassword = await bcrypt.hash(employeePassword, 10);
        // Check employee exists or not
        const Employee = await EmployeeModel.findOne({ mobileNum: reqDATA.mobileNum, })

        if (Employee) {
            return next(createHttpError("400", "mobile number is already registered with another account"))
        }


        // ON Success..
        const prettyDATA = {
            id: nanoid(),
            fullName: reqDATA.fullName,
            gender: reqDATA?.gender,
            mobileNum: reqDATA?.mobileNum,
            email: reqDATA?.email,
            dob: reqDATA?.dob,
            pinCode: reqDATA.pinCode,
            address: reqDATA.address,
            password: hashPassword
        }

        const newEmployee = await EmployeeModel.create(prettyDATA)

        if (!newEmployee) {
            return next(createHttpError(406, "Can't able to create new Employee Internal eroor."))
        }

        res.status(201).json({
            success: true,
            msg: "Successfully new employee created.",
            responseData: {
                email: reqDATA.email,
                // mobileNum: reqDATA.mobileNum,
                password: employeePassword
            }
        })

    } catch (error) {
        return next(createHttpError(401, `Internal error.${error}`))
    }

}


const EMPLOYEE_LIST = async (req, res, next) => {
    try {
        const Employee = await EmployeeModel.find({}, { __v: 0, _id: 0, updatedAt: 0, password: 0 });


        // Will add custom err message
        if (!Employee) {
            return next(createHttpError("400", "404"))
        }

        res.status(200).json(Employee)

    } catch (error) {
        return next(createHttpError(401, `Internal error ${error}`))
    }
}


const GET_SINGLE_EMPLOYEE = async (req, res, next) => {
    try {
        const EMP_ID = req?.params?.EMP_ID;
        if (!EMP_ID) {
            return next(createHttpError(400, "Oops!."))
        }

        const Employee = await EmployeeModel.findOne({ id: EMP_ID }, { _id: 0, __v: 0, password: 0, updatedAt: 0 });

        if (!Employee) {
            return next(createHttpError("400", "Request not found.."))
        }

        const prettyDATA = {
            success: true,
            ...Employee._doc
        }

        return res.status(200).json(prettyDATA)

    } catch (error) {
        return next(createHttpError(401, `Internal error ${error}`))
    }
}


const DELETE_EMPLOYEE = async (req, res, next) => {
    try {
        const EMP_ID = req?.params?.EMP_ID;

        if (!EMP_ID) {
            return next(createHttpError(401, "can not able to delete"))
        }

        const Employee = await EmployeeModel.findOneAndDelete({ id: EMP_ID })
        if (!Employee) {
            return next(createHttpError(401, "."))
        }

        // console.log(Employee);
        return res.status(204).json({})

    } catch (error) {
        return next(createHttpError(401, `Internal error${error}`))
    }
}



const LOGIN_EMPLOYEE = async (req, res, next) => {
    try {

    } catch (error) {
        return next(createHttpError(401, `Internal error ${error}`))
    }
}


export { NEW_EMPLOYEE, EMPLOYEE_LIST, GET_SINGLE_EMPLOYEE, DELETE_EMPLOYEE }