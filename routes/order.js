const Order = require('../model/order')
const User = require('../model/user')
const Cart = require('../model/cart')
const express = require('express');
const user = require('../model/user');
const product = require('../model/product');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware')
const catchAsync = require('../utils/catchasync');
const nodemailer = require('nodemailer')
const ejs = require('ejs')
const path = require('path')
const { v4: uuidv4 } = require('uuid');


router.post('/order',isLoggedIn,  catchAsync(async (req, res) => {
    try {

        const cart = await Cart.findOne({ userID: req.user._id }).populate('products.product');
        let totalPrice = 0;
        const orderProducts = cart.products.map((item) => {
            const productTotalPrice = item.quantity * item.product.price;
            totalPrice += productTotalPrice;
            return {
                product: item.product._id,
                quantity: item.quantity,
                title: item.product.title,
                price: item.product.price,
                category: item.product.category,
                images: item.product.images,
                productTotalPrice,

            };
        });
        if (!cart) {
            return res.status(404).send('Cart not found.');
        }

        const receiptNumber = uuidv4().split('-').pop();


        console.log(receiptNumber)
        const newOrder = new Order({
            userID: req.user._id,
            products: orderProducts,
            amount: totalPrice.toFixed(2),
            address: req.user.address,
            receipt: receiptNumber,
        });

        const savedOrder = await newOrder.save();
        const order = savedOrder;
        res.redirect(`/order/${order._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while creating the order.');
    }
}));


router.get('/order/:id',isLoggedIn, catchAsync(async (req, res) => {
    try {

        const order = await Order.findById(req.params.id).populate({
    path: 'products.product',
    populate: {
      path: 'images',
    }
});



        const orderProducts = order.products.map((item) => {
            const product = item.product;
            const productTotalPrice = item.quantity * product.price;
            return {
                product: product._id,
                quantity: item.quantity,
                title: product.title,
                price: product.price,
                category: product.category,
                images: product.images,
                productTotalPrice,

            };
        });
console.log('87', orderProducts)

        const totalPrice = orderProducts.reduce((total, product) => total + product.productTotalPrice, 0);

        res.render('order/order', { order, orderProducts, totalPrice });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
}));



router.get('/orders', isLoggedIn,(async (req, res) => {
  try {
    const orders = await Order.find({}).populate({
    path: 'products.product',
    populate: {
      path: 'images',
    },
  }).populate("userID", 'fullname');;

    const orderProducts = orders.flatMap((order) =>
      order.products.map((item) => {
        const product = item.product;
        const productTotalPrice = item.quantity * product.price;
        return {
          product: product._id,
          quantity: item.quantity,
          title: product.title,
          price: product.price,
          category: product.category,
           images: product.images,
          productTotalPrice,
        };
      })
    );

    const totalPrice = orderProducts.reduce(
      (total, product) => total + product.productTotalPrice,
      0
    );

    res.render('admindash/orders', { orders, orderProducts, totalPrice });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
}));


router.put('/order/:id/update',isLoggedIn, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    res.json({ success: true });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false });
  }
}));


router.delete('/:id',isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;

    const deleted = await Order.findByIdAndDelete(id);

    req.flash('success', 'Order List Deleted!')
    res.redirect('/');
}))



// updating the order in the dash-board
router.post('/save-schedule', (req, res) => {
  const { scheduleId, isChecked } = req.body;

  const updatedIsChecked = isChecked === 'true';

  Schedule.findByIdAndUpdate(
    scheduleId,
    { isChecked: updatedIsChecked },
    { new: true },
    (err, updatedSchedule) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    }
  );
});




module.exports = router;