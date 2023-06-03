const express = require('express')
const router = express.Router();
const Product = require('../model/product')
const catchAsync = require('../utils/catchasync');
const { isAdmin, isLoggedIn, isOwner, cartMiddleware } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const Cart = require('../model/cart');


// all products
router.get('/products', cartMiddleware, async (req, res) => {

    const products = await Product.find({});
    const { cartProducts, cart, totalPrice } = req.cart;
    res.render('product/index', { products, cartProducts, cart, totalPrice });

});


// creating product
router.post('/products', catchAsync(async (req, res) => {
    try {
        const product = new Product(req.body.product)
        const saveProduct = product.save();
console.log(saveProduct)
        res.redirect('/product-dashboard')
    } catch (err) {
        console.log(err.message);
        res.redirect('/')
    }
}))

router.get('/products/new', (req, res) => {

    res.render('product/new-product')
})

//show product
router.get('/products/:id', cartMiddleware, catchAsync(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', "We cannot find that product")
            res.redirect('/products')
        }
        const products = await Product.find({});
        const { cartProducts, cart, totalPrice } = req.cart;
        res.render('product/show', { product, products, cartProducts, cart, totalPrice })

    } catch (err) {
        next(err)
    }
}))
//update product
router.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id)
    if (!product) {
        req.flash('error', "We cannot find that product")
        res.redirect('/products')
    }
    res.render('product/edit', { product })
})

//show
router.put('/products/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, {...req.body.product});
    await product.save();
    req.flash('success', 'Product updated')
    res.redirect(`/product-dashboard`)

}))


//delete product
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);

    res.redirect('/product-dashboard');
}))






module.exports = router;