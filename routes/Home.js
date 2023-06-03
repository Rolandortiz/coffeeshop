const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchasync');
const { cartMiddleware } = require('../middleware');
const Cart = require('../model/cart');



router.get('/', cartMiddleware,catchAsync(async (req, res) => {

    const { cartProducts, cart, totalPrice } = req.cart;

    res.render('home', { cartProducts, cart, totalPrice });

}));


module.exports = router;