require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');

const setup = async (req, res) => {
  const Admin = mongoose.model('Admin');
  const AdminPassword = mongoose.model('AdminPassword');
  const Setting = mongoose.model('Setting');

  const PaymentMode = mongoose.model('PaymentMode');
  const Taxes = mongoose.model('Taxes');

  const newAdminPassword = new AdminPassword();

  const { name, email, password, language, timezone, country, config = {} } = req.body;

  const objectSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ name, email, password });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  // Prevent duplicate setup if an admin already exists
  const existingAdminCount = await Admin.countDocuments({ removed: false });
  if (existingAdminCount > 0) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Setup already completed. Admin account exists.',
    });
  }

  // Optional: prevent duplicate setup based on setting flag
  const setupDoneSetting = await Setting.findOne({ settingKey: 'idurar_setup_done' });
  if (setupDoneSetting && setupDoneSetting.settingValue === true) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Setup already completed.',
    });
  }

  const salt = uniqueId();

  const passwordHash = newAdminPassword.generateHash(salt, password);

  const accountOwnner = {
    email,
    name,
    role: 'owner',
    enabled: true,
  };
  const result = await new Admin(accountOwnner).save();

  const AdminPasswordData = {
    password: passwordHash,
    emailVerified: true,
    salt: salt,
    user: result._id,
  };
  await new AdminPassword(AdminPasswordData).save();

  // Generate JWT token and register session for immediate login
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
  const token = jwt.sign(
    {
      id: result._id,
    },
    jwtSecret,
    { expiresIn: '24h' }
  );
  await AdminPassword.findOneAndUpdate(
    { user: result._id },
    { $push: { loggedSessions: token } },
    { new: true }
  ).exec();

  const settingData = [];

  const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

  for (const filePath of settingsFiles) {
    const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const settingsToUpdate = {
      idurar_app_email: email,
      idurar_app_company_email: email,
      idurar_app_timezone: timezone,
      idurar_app_country: country,
      idurar_app_language: language || 'en_us',
    };

    const newSettings = file.map((x) => {
      const settingValue = settingsToUpdate[x.settingKey];
      return settingValue ? { ...x, settingValue } : { ...x };
    });

    settingData.push(...newSettings);
  }

  await Setting.insertMany(settingData);

  await Taxes.insertMany([{ taxName: 'Tax 0%', taxValue: '0', isDefault: true }]);

  await PaymentMode.insertMany([
    {
      name: 'Default Payment',
      description: 'Default Payment Mode (Cash , Wire Transfert)',
      isDefault: true,
    },
  ]);

  // Mark setup as done
  await Setting.findOneAndUpdate(
    { settingKey: 'idurar_setup_done' },
    { settingValue: true },
    { upsert: false }
  );

  return res.status(200).json({
    success: true,
    result: {
      _id: result._id,
      name: result.name,
      surname: result.surname,
      role: result.role,
      email: result.email,
      photo: result.photo,
      token: token,
      maxAge: null,
    },
    message: 'Successfully IDURAR App Setup',
  });
};

module.exports = setup;
