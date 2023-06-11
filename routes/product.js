const express = require('express')
const router = express.Router();
const Product = require('../model/product')
const catchAsync = require('../utils/catchasync');
const { isAdmin, isLoggedIn, isOwner, cartMiddleware } = require('../middleware');
const { storage } = require('../cloudinary');
const { cloudinary } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage })




// all products
router.get('/products', cartMiddleware, async (req, res) => {

    const products = await Product.find({});
    const { cartProducts, cart, totalPrice } = req.cart;
    res.render('product/index', { products, cartProducts, cart, totalPrice });

});


// creating product
router.post('/products',upload.array('image'), catchAsync(async (req, res) => {
    try {

        const product = new Product(req.body.product)
product.images = req.files.map(i => ({url: i.path, filename: i.filename}))
console.log(req.files)
        const saveProduct = product.save();

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
//edit form
router.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
console.log(id)
    const product = await Product.findById(id)
    if (!product) {
        req.flash('error', "We cannot find that product")
        res.redirect('/products')
    }
    res.render('product/edit', { product })
})


//update product
router.put('/products/:id',upload.array('image'), catchAsync(async (req, res, next) => {
    const { id } = req.params;
console.log(id)
    const product = await Product.findByIdAndUpdate(id, {...req.body.product});
const imgs = req.files.map(i => ({ url: i.path, filename: i.filename }));
    product.images.push(...imgs);
    await product.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await product.save();
    req.flash('success', 'Product updated')
    res.redirect(`/product-dashboard`)

}))



router.delete('/product/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
console.log(id)
    await Product.findByIdAndDelete(id);

    res.redirect('/product-dashboard');
}))






module.exports = router;