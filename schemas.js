const Product = require('../model/product')
const Joi = require('joi')


module.exports.Product = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required(),
        category: Joi.string().required(),
        price: Joi.number().required(),
        size: Joi.string().required(),
    })
})