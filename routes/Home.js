const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchasync');
const { cartMiddleware } = require('../middleware');
const Cart = require('../model/cart');
const User = require('../model/user');
const Product = require('../model/product');



router.get('/', cartMiddleware,catchAsync(async (req, res) => {
 const products = await Product.find({});
    const { cartProducts, cart, totalPrice } = req.cart;

    res.render('home', { cartProducts, cart, totalPrice, products});

}));


module.exports = router;