const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload')
const router = express.Router();

const userController = require('../controller/user-controller');


router.get('/getusers', userController.showAllUsers);
router.get('/:uid', userController.getCurrentUser)
router.post('/signup',
    fileUpload.single('image'), [
    check('name')
        .not()
        .isEmpty(),
    check('email')
        .not()
        .isEmpty(),
    check('password')
        .not()
        .isEmpty()

], userController.signup);

router.post('/login', userController.login);


module.exports = router;

