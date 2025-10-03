const downloadPdf = require('@/handlers/downloadHandler/downloadPdf');
const express = require('express');

const router = express.Router();

router.route('/:directory/:file').get(function (req, res) {
  console.log('🔍 DEBUG: Download route called with params:', req.params);
  try {
    const { directory, file } = req.params;
    const id = file.slice(directory.length + 1).slice(0, -4); // extract id from file name
    console.log('🔍 DEBUG: Extracted ID:', id);
    downloadPdf(req, res, { directory, id });
  } catch (error) {
    console.log('🔍 DEBUG: Error in download route:', error.message);
    return res.status(503).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
});

module.exports = router;
