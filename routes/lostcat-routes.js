const exp = require('constants');
const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload')

const fs = require('fs');

const chechAuth = require('../middleware/check-auth')
const lostCatControllers = require('../controller/lostcat-controller');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();



router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.get('/lostcats', lostCatControllers.getAllLostCats);
router.get('/:pid', lostCatControllers.getCurrentCat);
router.get('/user/:uid', lostCatControllers.getLostCatByUserId);
router.use(checkAuth)
router.delete('/:pid', lostCatControllers.removeLostCat);
router.patch('/:pid', lostCatControllers.updateLostCat);


router.post('/addlostcat',
    fileUpload.single('image'),
    [check('name')
        .not()
        .isEmpty(),
    check('place')
        .not()
        .isEmpty()

    ],

    lostCatControllers.createLostCat);



module.exports = router;