const custom = require('@/controllers/pdfController');
const mongoose = require('mongoose');

module.exports = downloadPdf = async (req, res, { directory, id }) => {
  try {
    console.log('🔍 DEBUG: Starting downloadPdf with directory:', directory, 'id:', id);
    
    // Map directory names to model names
    let modelName;
    if (directory === 'stockmovement') {
      modelName = 'StockMovement';
    } else {
      // Capitalize first letter for other directories
      modelName = directory.charAt(0).toUpperCase() + directory.slice(1);
    }

    console.log('🔍 DEBUG: Model name resolved to:', modelName);

    if (mongoose.models[modelName]) {
      console.log('🔍 DEBUG: Model exists, searching for document...');
      const Model = mongoose.model(modelName);
      const result = await Model.findOne({
        _id: id,
      }).exec();

      console.log('🔍 DEBUG: Document found:', !!result);

      // Throw error if no result
      if (!result) {
        throw { name: 'ValidationError' };
      }

      // Continue process if result is returned

      console.log('🔍 DEBUG: Starting PDF generation...');
      const fileId = modelName.toLowerCase() + '-' + result._id + '.pdf';
      const folderPath = modelName.toLowerCase();
      const targetLocation = `src/public/download/${folderPath}/${fileId}`;
      
      console.log('🔍 DEBUG: Target location:', targetLocation);
      
      await custom.generatePdf(
        modelName,
        { filename: folderPath, format: 'A4', targetLocation },
        result,
        async () => {
          console.log('🔍 DEBUG: PDF generated successfully, sending download...');
          return res.download(targetLocation, (error) => {
            if (error) {
              console.log('🔍 DEBUG: Download error:', error.message);
              return res.status(500).json({
                success: false,
                result: null,
                message: "Couldn't find file",
                error: error.message,
              });
            }
            console.log('🔍 DEBUG: Download completed successfully');
          });
        }
      );
    } else {
      return res.status(404).json({
        success: false,
        result: null,
        message: `Model '${modelName}' does not exist`,
      });
    }
  } catch (error) {
    // If error is thrown by Mongoose due to required validations
    if (error.name == 'ValidationError') {
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: 'Required fields are not supplied',
      });
    } else if (error.name == 'BSONTypeError') {
      // If error is thrown by Mongoose due to invalid ID
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: 'Invalid ID',
      });
    } else {
      // Server Error
      return res.status(500).json({
        success: false,
        result: null,
        error: error.message,
        message: error.message,
        controller: 'downloadPDF.js',
      });
    }
  }
};
