const express = require('express')
const router = express.Router();
const Product = require('../model/product')
const User = require('../model/user')
const Cart = require('../model/cart')
const { isAdmin, isLoggedIn, isOwner, cartUpdate, productDelete, createCart,updateCart, cartMiddleware, } = require('../middleware');
const catchasync = require('../utils/catchasync');





router.post('/products/:id/cart', isLoggedIn, createCart, async (req, res) => {
    const productId = req.params.id;

    // Retrieve the product details from the database
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
        success: true,
        title: product.title,
        quantity: 1,
        productTotalPrice: 1 * product.price,
        category: product.category[0],
        price: product.price,
        images: product.images

    });

});


router.patch('/cart/update', isLoggedIn,cartMiddleware, updateCart, (req, res) => {
  res.json({ success: true });
});

router.post('/cart/:productId/update', isLoggedIn, isOwner, cartUpdate, async (req, res) => {

    res.json(200)
});
router.post('/cart/:productId/delete', isLoggedIn, isOwner, productDelete, async (req, res) => {
    try {

        const cart = await Cart.findOne({ user: req.user._id }).populate('products');
        const cartProducts = cart ? cart.products : [];
        const totalPrice = cart ? cart.totalPrice : 0;

        if (cartProducts.length === 0) {
            res.status(200).json({ cartProducts, totalPrice, isEmpty: true });
        } else {
            res.status(200).json({ cartProducts, totalPrice, isEmpty: false });
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred');
        res.redirect('/');
    }
});









module.exports = router;