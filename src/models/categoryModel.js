const { Schema, model } = require('mongoose')

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true })

const Category = model('Category', CategorySchema)
module.exports = Category