const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchasync');
const { cartMiddleware } = require('../middleware');
const Product = require('../model/product');
const Review = require('../model/review');
const Paid = require('../model/paid');
const moment = require('moment');
const mongoosePaginate = require('mongoose-paginate-v2');



router.get('/', cartMiddleware,catchAsync(async (req, res) => {
const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 3;
    const options = {
        sort: { createdAt: 'desc' },
        page: page,
        limit: pageSize,
        populate:{path: 'owner'}
    };
    const reviews = await Review.paginate({}, options);
const { hasPrevPage, prevPage, totalPages, hasNextPage, nextPage } = reviews;
console.log(hasPrevPage)
console.log(prevPage)
console.log(totalPages)
console.log(hasNextPage)
console.log(nextPage)


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


    res.render('home', { cartProducts, cart, totalPrice, products, bestSellerProducts, reviews,hasPrevPage,
    prevPage,
    totalPages,
    hasNextPage,
    nextPage});

}));


module.exports = router;