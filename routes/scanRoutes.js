const scanController = require('../controllers/scanController');
const Joi = require('joi');

module.exports = [
  {
    method: 'GET',
    path: '/api/scans/{userId}',
    handler: async (request, h) => {
      return scanController.getUserScans(request, h);
    }
  },
  {
    method: 'POST',
    path: '/api/scans',
    handler: scanController.createScan,
    options: {
      validate: {
        payload: Joi.object({
          userId: Joi.string().required(),
          classification: Joi.string().required(),
          confidence: Joi.number().required()
        })
      }
    }
  }
]; 