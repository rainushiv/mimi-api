const mongoose = require('mongoose')

const lostCatSchema = new mongoose.Schema({

    name: { type: String, required: true },
    place: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    image: { type: String, required: true }
})

module.exports = mongoose.model('LostCat', lostCatSchema)