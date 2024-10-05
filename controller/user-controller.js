const { validationResult } = require('express-validator')
const HttpError = require('../Models/http-error')
const User = require('../Models/userModel')
const userModel = require('../Models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const winston = require('winston');
require('../logger')


const UserLogger = winston.loggers.get('UserLogger')



const showAllUsers = async (req, res, next) => {

    let users;
    try {
        users = await userModel.find({}, '-password')

    } catch (err) {

        const error = new HttpError('failed to get users', 500)
        return next(error)

    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) })

}
const signup = async (req, res, next) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid Inputs passed, please check your data', 472)
        )
    }
    const { name, email, password, } = req.body;

    let existingUser

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Sign up failed please try again later', 500)
        return next(error)
    }

    if (existingUser) {

        const error = new HttpError('User already exists', 422)
        return next(error);
    }

    let hashedPassword;
    try {

        hashedPassword = await bcrypt.hash(password, 12)

    } catch (err) {
        const error = new HttpError('Something went Wrong Please try again later ', 500)
        return next(error)
    }

    const createdUser = new User({

        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        lostCats: []
    })

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Something Went Wrong', 500)

        return next(error);
    }

    let token
    try {
        if (!createdUser || !createdUser.id || !createdUser.email) {
            throw new Error('User data is incomplete');
        }
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, 'secretkey', { expiresIn: '1h' })
    } catch (err) {
        const error = new HttpError('Something Went Wrong with token', 500)

        return next(err);
    }
    res.status(201).json({
        userId: createdUser.id,
        email: createdUser.email,
        token: token
    })

};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser

    try {
        existingUser = await User.findOne({ email: email })
    } catch (error) {
        console.log(error)

        return next(error)
    }

    if (!existingUser) {
        const error = "wrong credentials try again"
        return next(error)
    }
    let isValidPassword = false
    try {


        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        const error = new HttpError('Something Went Wrong with password', 500)

        return next(error);

    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials, could not log you in ', 500)

        return next(error);
    }
    let token;
    try {
        if (!existingUser || !existingUser.id || !existingUser.email) {
            throw new Error('User data is incomplete');
        }

        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'secretkey', { expiresIn: '1h' })
    } catch (err) {
        const error = new HttpError('Something Went Wrong with token', 500)

        return next(err);
    }
    res.json({ message: 'logged in', user: existingUser.toObject({ getters: true }), token: token })


};

const getCurrentUser = async (req, res, next) => {
    const userId = req.params.uid;
    let currentUser
    try {

        currentUser = await User.findOne({ _id: userId }, '-password')

    } catch (err) {
        const error = new HttpError('Something Went Wrong', 500)

        return next(error)
    }

    if (!currentUser) {
        const error = new HttpError('No user found', 500)

        return next(error)
    }

    res.json({ user: currentUser.toObject({ getters: true }) })

}


exports.getCurrentUser = getCurrentUser;
exports.signup = signup;
exports.login = login;
exports.showAllUsers = showAllUsers;
