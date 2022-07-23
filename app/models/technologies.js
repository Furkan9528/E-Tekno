const mongoose = require('mongoose')
const Schema = mongoose.Schema


const technologiesSchema = new Schema({
    productName : { type: String, required: true},
    info : { type: String, required: true},
    description : { type: String, required: true},
    image : { type: String, required: true},
    price : { type: Number, required: true}

})

module.exports = mongoose.model('Technologies', technologiesSchema)
