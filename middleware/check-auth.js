const jwt = require('jsonwebtoken')
const HttpError = require('../Models/http-error')


module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next()
    }
    try {


        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            throw new Error('ya fooked up')
        }
        const decodedToken = jwt.verify(token, 'secretkey')
        req.userData = { userId: decodedToken.userId }
        next()


    } catch (err) {


        const error = new HttpError('Authentication Failed', 401)
    }
}