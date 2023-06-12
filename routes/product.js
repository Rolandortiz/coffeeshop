const express = require('express')
const router = express.Router();
const Product = require('../model/product')
const Paid = require('../model/paid')
const catchAsync = require('../utils/catchasync');
const { isAdmin, isLoggedIn, isOwner, cartMiddleware } = require('../middleware');
const { storage } = require('../cloudinary');
const { cloudinary } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage })
const moment = require('moment');




// all products
router.get('/products', cartMiddleware, async (req, res) => {
const paidOrders = await Paid.find().populate('products.product');
    const products = await Product.find({});
    const { cartProducts, cart, totalPrice } = req.cart;

const totalSale = paidOrders.reduce((total, order) => total + parseFloat(order.totalSales), 0);

        const monthlyData = Array(12).fill(0);
paidOrders.forEach(order => {
            const orderMonth = moment(order.createdAt).month();
            monthlyData[orderMonth] += parseFloat(order.totalSales);
        });

        const productSalesMap = new Map();

        paidOrders.forEach(order => {
            order.products.forEach(product => {
                const { _id, title } = product.product;
                const quantity = product.quantity;

                if (productSalesMap.has(_id)) {
                    productSalesMap.set(_id, productSalesMap.get(_id) + quantity);
                } else {
                    productSalesMap.set(_id, quantity);
                }
            });
        });

        // Remove deleted products from productSalesMap
        const existingProductIds = new Set();

        paidOrders.forEach(order => {
            order.products.forEach(product => {
                const { _id } = product.product;
                existingProductIds.add(_id);
            });
        });

        for (const productId of productSalesMap.keys()) {
            if (!existingProductIds.has(productId)) {
                productSalesMap.delete(productId);
            }
        }

        // Update bestSellerProducts with existing products only
        const bestSellerProducts = [...productSalesMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([productId, sales]) => {
                const foundProduct = paidOrders.find(order => order.products.find(product => product.product && product.product._id.equals(productId)));

                return {
                    product: foundProduct ? foundProduct.products.find(product => product.product && product.product._id.equals(productId)).product : null,
                    sales
                };
            });


    res.render('product/index', { products, cartProducts, cart, totalPrice, bestSellerProducts });

});


// creating product
router.post('/products',upload.array('image'), catchAsync(async (req, res) => {
    try {

        const product = new Product(req.body.product)
product.images = req.files.map(i => ({url: i.path, filename: i.filename}))
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
    await Product.findByIdAndDelete(id);

    res.redirect('/product-dashboard');
}))






module.exports = router;