const Order = require('../model/order')
const Cart = require('../model/cart')
const Paid = require('../model/paid')
const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware')
const catchAsync = require('../utils/catchasync');
const { v4: uuidv4 } = require('uuid');


router.post('/paid', isLoggedIn,isAdmin,catchAsync(async (req, res) => {
    try {
        const order = await Order.findOne({ userID: req.user._id }).sort({ createdAt: -1 });

        if (!order) {
            return res.status(404).send('Order not found.');
        }

        const receiptNumber = order.receipt;
        const totalPrice = order.amount;

        // Store product details (including ID) instead of the full product object
        const products = order.products.map(product => {
            return {
                product: product.product,
                quantity: product.quantity
            };
        });

        const newPaidOrder = new Paid({
            userID: req.user._id,
            products,
            totalSales: totalPrice,
            address: order.address,
            receipt: receiptNumber,
        });

        const savedPaidOrder = await newPaidOrder.save();
        const paid = savedPaidOrder;

        res.redirect(`/`);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while creating the order.');
    }
}));

router.delete('/:id', isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(id)
    const deleted = await Order.findByIdAndDelete(id);

    req.flash('success', 'Order List Deleted!')
    res.redirect('/');
}))







module.exports = router;