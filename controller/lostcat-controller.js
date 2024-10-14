const MongoClient = require('mongodb').MongoClient;
const getCoordsForAddress = require('../util/location')
const mongoose = require('mongoose')
const { validationResult } = require('express-validator')
const LostCatModel = require('../Models/lostCatModel')
const UserModel = require('../Models/userModel');
const userModel = require('../Models/userModel');
const HttpError = require('../Models/http-error');
const winston = require('winston');
require('../logger')


const CatLogger = winston.loggers.get('CatLogger')



const getAllLostCats = async (req, res, next) => {

    let lostCats

    try {

        lostCats = await LostCatModel.find({})
    } catch (err) {
        const error = new HttpError('Something went wrong', 500)
        return next(error);
    }
    res.set('Access-Control-Allow-Origin', 'https://shivalry.dev')
    res.json({ lostCats: lostCats.map(lostCat => lostCat.toObject({ getters: true })) });

    CatLogger.info('Get all cat request')
};

const getLostCatByUserId = async (req, res, next) => {

    const userId = req.params.uid;
    let lostCat
    try {
        lostCat = await LostCatModel.find({ creator: userId });
    }
    catch (error) {
        console.log(error)

        return next(error)
    }

    CatLogger.http('Get cat by user request')
    res.json({ lostCats: lostCat.map(lostCat => lostCat.toObject({ getters: true })) })
}




const createLostCat = async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.json({ message: ' invalid input passed' })
    }
    const { name, place, creator } = await req.body;

    let coordinates
    try {


        coordinates = await getCoordsForAddress(place)
    } catch (err) {

        return next(err)
    }


    const createdLostCat = new LostCatModel({

        name,
        place,
        location: coordinates,
        creator,
        image: req.file.path
    });

    let user

    try {
        user = await UserModel.findById(creator)
    } catch (error) {
        console.log(error)
    }

    if (!user) {
        const error = 'This userId does not exist';

        return next(error)
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdLostCat.save({ session: sess })
        user.lostCats.push(createdLostCat)
        await user.save({ session: sess })
        await sess.commitTransaction();

    } catch (err) {
        console.log(err)

        return next(err);
    }

    //DUMMY_CATS.push(createdLostCat);

    res.status(201).json({ lostCat: createdLostCat.toObject({ getters: true }) });

}

const removeLostCat = async (req, res, next) => {
    const lostCatId = req.params.pid;

    let lostCat;
    try {

        lostCat = await LostCatModel.findById(lostCatId).populate('creator');

    } catch (error) {

        console.log(error)
        return next(error)
    }
    if (!lostCat) {
        console.log('could not find cat with this id')
        return next()
    }
    if (lostCat.creator.id !== req.userData.userId) {

        const error = new HttpError('You dont have permission to delete this place', 401)

        return next(error)
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await lostCat.deleteOne({ session: sess });
        lostCat.creator.lostCats.pull(lostCat);
        await lostCat.creator.save({ session: sess });
        await sess.commitTransaction();

    } catch (error) {

        console.log(error)
        return next(error);
    }

    res.status(201).json({ message: 'Deleted place successfully' })
}


const updateLostCat = async (req, res, next) => {

    const { name, place } = req.body;
    const catId = req.params.pid

    let currentCat;

    try {

        currentCat = await LostCatModel.findById(catId);
    } catch (err) {

        const error = new HttpError('Something Went Wrong', 500)

        return next(error)
    }
    if (currentCat.creator.toString() !== req.userData.userId) {

        const error = new HttpError('You dont have permission to edit this place', 401)

        return next(error)
    }
    currentCat.name = name;

    currentCat.place = place;

    try {

        await currentCat.save();
    } catch (err) {

        const error = new HttpError('Failed to updated', 500)

        next(error)
    }

    res.status(200).json({ lostCat: currentCat.toObject({ getters: true }) })

}





const getCurrentCat = async (req, res, next) => {

    const catId = req.params.pid

    let currentCat

    try {

        currentCat = await LostCatModel.findOne({ _id: catId })
    } catch (err) {
        const error = new HttpError('Something Went Wrong', 500)

        return next(error)
    }
    if (!currentCat) {

        const error = new HttpError('no cat found', 500)

        return next(error)
    }

    res.json({ lostCat: currentCat.toObject({ getters: true }) })

}

exports.getAllLostCats = getAllLostCats;
exports.createLostCat = createLostCat;
exports.getLostCatByUserId = getLostCatByUserId;
exports.removeLostCat = removeLostCat;
exports.updateLostCat = updateLostCat;
exports.getCurrentCat = getCurrentCat;