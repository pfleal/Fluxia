const express = require('express');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const adminAuth = require('@/controllers/coreControllers/adminAuth');
const setupController = require('@/controllers/coreControllers/setup');

router.route('/login').post(catchErrors(adminAuth.login));

router.route('/forgetpassword').post(catchErrors(adminAuth.forgetPassword));
router.route('/resetpassword').post(catchErrors(adminAuth.resetPassword));

router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

// Public registration route to create initial admin and settings
router.route('/register').post(catchErrors(setupController));
// Alias for setup for compatibility
router.route('/setup').post(catchErrors(setupController));

module.exports = router;
