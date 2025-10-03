const mongoose = require('mongoose');
const Model = mongoose.model('Quality');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Quality');

const summary = require('./summary');

// Override the create method to add quality-specific logic
methods.create = async (req, res) => {
  try {
    const result = await new Model({
      ...req.body,
      createdBy: req.admin._id,
    }).save();

    return res.status(200).json({
      success: true,
      result,
      message: 'Quality record created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

// Override the update method to add quality-specific logic
methods.update = async (req, res) => {
  try {
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      {
        ...req.body,
        updatedBy: req.admin._id,
        updated: new Date(),
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Quality record not found',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Quality record updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

methods.summary = summary;

module.exports = methods;