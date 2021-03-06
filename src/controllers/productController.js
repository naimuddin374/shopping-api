const { Product, SubCategory } = require('../models')
const validator = require('../validators')
const { validationError, serverError, createdSuccess, badRequest, actionSuccess, updatedSuccess, deleteSuccess } = require('../utils');
const { objectIdIsValid } = require('../utils/helper');



// GET LIST
exports.list = async (req, res) => {
    try {
        let result = await Product.find().populate('subcategory');
        return actionSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}



// GET BY ID
exports.getById = async (req, res) => {
    try {
        let result = await Product.findById(req.params.id).populate('subcategory');
        return actionSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}


// GET BY SUB CATEGORY ID
exports.getBySubCatId = async (req, res) => {
    try {
        let result = await Product.find({ subcategory: req.params.id }).populate('subcategory');
        return actionSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}


// GET BY CATEGORY ID
exports.getByCatId = async (req, res) => {
    try {
        let result = await Product.find({ subcategory: { category: req.params.id } }).populate('subcategory');
        return actionSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}


// GET BY TITLE
exports.getBySearch = async (req, res) => {
    const title = req.query.title || '';
    const description = req.query.description || '';
    try {
        let result = await Product.find({
            "title": { "$regex": title, "$options": "i" },
            "description": { "$regex": description, "$options": "i" },
        }).populate('subcategory');
        return actionSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}



// INSERT
exports.insert = async (req, res) => {
    let { title, description, price, discount, subcategory, sizes, colors } = req.body


    // CHECK VALIDATION
    const formField = {
        "title": title,
        "description": description,
        "price": price,
        "discount": discount,
        "subcategory": subcategory,
    }
    const validate = validator(formField);
    if (!validate.isValid) {
        return validationError(res, validate.error);
    }


    try {
        if (!objectIdIsValid(subcategory)) {
            return badRequest(res, null, 'Invalid ID!');
        }

        // FIND SUB CATEGORY
        let findScat = await SubCategory.findById(subcategory);
        if (!findScat) {
            return badRequest(res, null, 'Invalid subcategory!');
        }

        // CHECK UNIQUE
        let findData = await Product.findOne({ title, subcategory });
        if (findData) {
            return badRequest(res, null, 'Content already exists!');
        }

        // SAVE DATA
        formField.sizes = sizes
        formField.colors = colors
        const schema = new Product(formField);
        await schema.save();
        const result = await Product.findById(schema._id).populate('subcategory');
        return createdSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}



// UPDATE
exports.update = async (req, res) => {
    let { title, description, price, discount, subcategory, sizes, colors } = req.body

    // CHECK VALIDATION
    const formField = {
        "title": title,
        "description": description,
        "price": price,
        "discount": discount,
        "subcategory": subcategory,
    }
    const validate = validator(formField);
    if (!validate.isValid) {
        return validationError(res, validate.error);
    }


    try {
        // CHECK ID 
        let findData = await Product.findById(req.params.id);
        if (!findData) {
            return badRequest(res, null, 'Content Not Found!');
        }

        // UPDATE DATA
        formField.sizes = sizes
        formField.colors = colors
        await Product.findByIdAndUpdate(req.params.id, { $set: formField }, { new: true, useFindAndModify: false });
        const result = await Product.findById(req.params.id).populate('subcategory');
        return updatedSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}




// DELETE
exports.remove = async (req, res) => {
    try {
        // CHECK ID
        let findData = await Product.findById(req.params.id);
        if (!findData) {
            return badRequest(res, null, 'Content Not Found!');
        }

        // UPDATE DATA
        let result = await Product.findByIdAndDelete(req.params.id)
        return deleteSuccess(res, result);
    } catch (error) {
        return serverError(res, error);
    }
}
