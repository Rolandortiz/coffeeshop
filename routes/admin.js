const express = require('express')
const router = express.Router();
const User = require('../model/user');
const Paid = require('../model/paid');
const Product = require('../model/product');
const Schedule = require('../model/schedule');
const catchAsync = require('../utils/catchasync');
const { isAdmin } = require('../middleware')
const moment = require('moment');



const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// ...

router.get("/userdash", isAdmin, catchAsync(async (req, res) => {
    const query = req.query.new;
    try {
        const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find({})
        const isAdmin = req.user && req.user.isAdmin;
        const date = new Date();
        const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" }
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 }
                }
            }
        ]);

        // Convert month numbers to month names
        const transformedData = data.map(item => {
            const monthName = monthNames[item._id - 1] || '';
            return { ...item, monthName };
        });

        res.render('admindash/user-dashboard', { users, isAdmin, data: transformedData });
    } catch (err) {
        console.log(err.message)
    }
}));

// router.get('/dashboard', isAdmin, catchAsync(async (req, res) => {
//     try {
//         const paidOrders = await Paid.find().populate('products.product');

//         const totalSale = paidOrders.reduce((total, order) => total + parseFloat(order.totalSales), 0);

//         const monthlyData = Array(12).fill(0);

//         paidOrders.forEach(order => {
//             const orderMonth = moment(order.createdAt).month();
//             monthlyData[orderMonth] += parseFloat(order.totalSales);
//         });

//         const productSalesMap = new Map();

//         paidOrders.forEach(order => {
//             order.products.forEach(product => {
//                 const { _id, title } = product.product;
//                 const quantity = product.quantity;

//                 if (productSalesMap.has(_id)) {
//                     productSalesMap.set(_id, productSalesMap.get(_id) + quantity);
//                 } else {
//                     productSalesMap.set(_id, quantity);
//                 }
//             });
//         });

//         const bestSellerProducts = [...productSalesMap.entries()]
//             .sort((a, b) => b[1] - a[1])
//             .map(([productId, sales]) => {
//                 const foundProduct = paidOrders.find(order => order.products.find(product => product.product && product.product._id.equals(productId)));

//                 return {
//                     product: foundProduct ? foundProduct.products.find(product => product.product && product.product._id.equals(productId)).product : null,
//                     sales
//                 };
//             });
//         const date = new Date();
//         const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

//         const activeUsers = await User.find({ lastActivity: { $gte: lastYear } });
//         const totalInteractions = activeUsers.reduce((total, user) => total + user.interactions, 0);

//         const usersWithPercentage = activeUsers.map(user => {
//             const percentage = (user.interactions / totalInteractions) * 100;
//             return { user, percentage };
//         });


//         return res.render('admindash/dashboard', { totalSale, monthlyData,  activeUsers, bestSellerProducts, usersWithPercentage });
//     } catch (err) {
//         console.log(err.message);
//         res.status(500).send('An error occurred while fetching the dashboard data.');
//     }
// }));
router.get('/dashboard', isAdmin, catchAsync(async (req, res) => {
    try {
        const paidOrders = await Paid.find().populate('products.product');

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

        const date = new Date();
        const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

        const activeUsers = await User.find({ lastActivity: { $gte: lastYear } });
        const totalInteractions = activeUsers.reduce((total, user) => total + user.interactions, 0);

        const usersWithPercentage = activeUsers.map(user => {
            const percentage = (user.interactions / totalInteractions) * 100;
            return { user, percentage };
        });

        return res.render('admindash/dashboard', { totalSale, monthlyData, activeUsers, bestSellerProducts, usersWithPercentage });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('An error occurred while fetching the dashboard data.');
    }
}));



router.delete('/user/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    res.redirect('/userdash');
}))



// calendar

// router.get('/calendar', (req, res) => {
//   const currentDate = moment();
//   const year = currentDate.year();
//   let month = currentDate.month() + 1;

//   // Check if a query parameter for the month is provided
//    if (req.query.month) {
//     // Parse the month parameter as an integer
//     const requestedMonth = parseInt(req.query.month);

//     // Validate the requested month
//     if (requestedMonth >= 1 && requestedMonth <= 12) {
//       month = requestedMonth;
//     }
//   }
//  const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
//   const monthName = monthNames[month - 1];

//   const calendar = generateCalendarData(year, month);

//   res.render('admindash/calendar', { year, month,monthName, calendar });
// });

// function generateCalendarData(year, month){
// const calendar = []

// const firstDayOfMonth = moment({year, month: month -1}).startOf('month')
// const startDay = firstDayOfMonth.clone().startOf('week')
// const endDay = firstDayOfMonth.clone().endOf('month').endOf('week')
//  let currentDay = startDay.clone();
//   while (currentDay.isSameOrBefore(endDay, 'day')) {
//     const week = [];
//     for (let i = 0; i < 7; i++) {
//       week.push({
//         day: currentDay.date(),
//         isCurrentMonth: currentDay.month() === firstDayOfMonth.month(),
//         isToday: currentDay.isSame(moment(), 'day')
//       });
//       currentDay.add(1, 'day');
//     }
//     calendar.push(week);
//   }

//   return calendar;
// }

router.get('/calendar', async(req, res) => {
  const currentDate = moment();
  const year = currentDate.year();
  let month = currentDate.month() + 1;


   if (req.query.month) {

    const requestedMonth = parseInt(req.query.month);


    if (requestedMonth >= 1 && requestedMonth <= 12) {
      month = requestedMonth;
    }
  }
 const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1];

const calendar = generateCalendarData(year, month)
const startDayOfWeek = 0;
  const weeks = generateWeekCalendarData(year, month,startDayOfWeek);
 const isMonthActive = req.query.tab !== 'week';
  const isWeekActive = !isMonthActive;
  const firstDayOfMonth = moment({ year, month: month - 1 }).startOf('month');
  const endDay = firstDayOfMonth.clone().endOf('month').endOf('week');
const schedules = await Schedule.find({ date: { $gte: firstDayOfMonth, $lte: endDay } });


  res.render('admindash/calendar', { year, month,monthName, calendar,weeks, isWeekActive,isMonthActive,schedules });
});

function generateWeekCalendarData(year, month, startDayOfWeek) {
  const calendar = [];

  const currentDate = moment();
  const firstDayOfMonth = moment({ year, month: month - 1 }).startOf('month');
  const currentDay = currentDate.startOf('week').add(startDayOfWeek, 'days');

  const week = [];
  for (let i = 0; i < 7; i++) {
    week.push({
      day: currentDay.date(),
      isCurrentMonth: currentDay.month() === firstDayOfMonth.month(),
      isToday: currentDay.isSame(moment(), 'day')
    });
    currentDay.add(1, 'day');
  }

  calendar.push(week);

  return calendar;
}


function generateCalendarData(year, month){
const calendar = []

const firstDayOfMonth = moment({year, month: month -1}).startOf('month')
const startDay = firstDayOfMonth.clone().startOf('week')
const endDay = firstDayOfMonth.clone().endOf('month').endOf('week')
 let currentDay = startDay.clone();
  while (currentDay.isSameOrBefore(endDay, 'day')) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        day: currentDay.date(),
        isCurrentMonth: currentDay.month() === firstDayOfMonth.month(),
        isToday: currentDay.isSame(moment(), 'day')
      });
      currentDay.add(1, 'day');
    }
    calendar.push(week);
  }

  return calendar;
}

//products-admin
router.get('/product-dashboard', async (req, res) => {

    const products = await Product.find({});
    res.render('admindash/product-dashboard', { products });

});






module.exports = router;