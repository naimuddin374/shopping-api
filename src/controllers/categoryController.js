const { Category } = require("../models");
const validator = require("../validators");
const {
  validationError,
  serverError,
  createdSuccess,
  badRequest,
  actionSuccess,
  updatedSuccess,
  deleteSuccess,
} = require("../utils");
const fileUpload = require("../utils/fileUpload");
const { getQueryParams } = require("../utils/query-params");

// GET LIST
exports.list = async (req, res) => {
  const query = {};
  const { page, limit, keyword } = getQueryParams(req);
  try {
    // You can add filters to your query if needed
    if (keyword) {
      query.$or = [{ name: { $regex: keyword, $options: "i" } }];
    }

    /** Data pull from database */
    const data = await Category.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    const totalDocument = await Category.countDocuments(query);

    const response = {
      data,
      totalDocument,
      totalPages: Math.ceil(totalDocument / limit),
      currentPage: page,
    };
    return actionSuccess(res, response);
  } catch (error) {
    return serverError(res, error);
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const result = await Category.findById(req.params.id);
    return actionSuccess(res, result);
  } catch (error) {
    return serverError(res, error);
  }
};

// INSERT
exports.insert = async (req, res, next) => {
  let { name } = req.body;

  try {
    const uploadFile = await fileUpload.fileUploadHandler(req, res, next);

    // CHECK VALIDATION
    const formField = {
      name: name,
      image: uploadFile,
    };
    const validate = validator(formField);
    if (!validate.isValid) {
      return validationError(res, validate.error);
    }

    // CHECK UNIQUE
    const findData = await Category.findOne({ name });
    if (findData) {
      return badRequest(res, null, "Content already exists!");
    }

    // SAVE DATA
    const schema = new Category(formField);
    const result = await schema.save();
    return createdSuccess(res, result);
  } catch (error) {
    return serverError(res, error);
  }
};

// UPDATE
exports.update = async (req, res, next) => {
  let { name } = req.body;

  // CHECK VALIDATION
  const formField = {
    name: name,
  };
  const validate = validator(formField);
  if (!validate.isValid) {
    return validationError(res, validate.error);
  }

  try {
    // CHECK ID
    let findData = await Category.findById(req.params.id);
    if (!findData) {
      return badRequest(res, null, "Content Not Found!");
    }

    // REMOVE AND UPLOAD NEW IMAGE
    const uploadFile = await fileUpload.fileUploadHandler(req, res, next);
    if (uploadFile) {
      formField.image = uploadFile;
      if (findData.image) {
        await fileUpload.fileDeleteHandler(findData.image);
      }
    }

    // UPDATE DATA
    const result = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: formField },
      { new: true, useFindAndModify: false }
    );
    return updatedSuccess(res, result);
  } catch (error) {
    return serverError(res, error);
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    // CHECK ID
    const findData = await Category.findById(req.params.id);
    if (!findData) {
      return badRequest(res, null, "Content Not Found!");
    }

    // Image delete
    if (findData.image) {
      await fileUpload.fileDeleteHandler(findData.image);
    }

    // UPDATE DATA
    const result = await Category.findByIdAndDelete(req.params.id);
    return deleteSuccess(res, result);
  } catch (error) {
    return serverError(res, error);
  }
};
