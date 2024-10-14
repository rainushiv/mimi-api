const fs = require('fs')
const path = require('path')
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const lostcatRoutes = require('./routes/lostcat-routes')
const userroutes = require('./routes/user-routes')
const cors = require('cors')
const mongoose = require('mongoose');
require("dotenv").config();

app.use(bodyParser.json())
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(express.static('images'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://shivalry.dev');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    res.setHeader(
        'Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE'
    )
    next()

})


app.get('/', (req, res, next) => {

    res.json({ message: "fuck it we ball" })
});
app.use('/api/lost', lostcatRoutes);
app.use('/api/user', userroutes)



app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err)
        })
    }


    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'an error occured' });
})

app.use((req, res, next) => {

    res.status(404).send('<h1>Page not found</h1>')
})

mongoose.connect(
    process.env.MONGODB_DATABASE_KEY || "guest"
).then(() => {
    app.listen(4000, () => { console.log('app is running on localhost 4000') });
}).catch(err => {
    console.log(err);
})

