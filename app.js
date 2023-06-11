// connectsions
const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')
const ejsMate = require('ejs-mate')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')

const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const cors = require('cors')
const helmet = require('helmet')
const MongoDBStore = require("connect-mongo");
const mongoSanitize = require('express-mongo-sanitize');
// router
const homeRoute = require('./routes/Home')
const userRoute = require('./routes/user')
const productRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const cartRoute = require('./routes/cart')
const paidRoute = require('./routes/paid')
const adminRoute = require('./routes/admin')
const scheduleRoute = require('./routes/schedules')
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const paypal = require('@paypal/checkout-server-sdk');
const axios = require('axios');
const environment = process.env.ENVIRONMENT || 'sandbox'
const endpoint_url = environment === 'sandbox'? 'https://api-m.sandbox.paypal.com' :'https://api-m.paypal.com';

const { isAdmin, isLoggedIn, isOwner, cartMiddleware } = require('./middleware');

// models
const User = require('./model/user')
const Paid = require('./model/paid')
const Order = require('./model/order')
const Product = require('./model/product')
// Data base
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/paulamedCafe'


mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, " connection error:"));
db.once("open", () => {
    console.log("Database Connected");
})

//session
// const sessionConfig = {
//     secret: "secretla",
//     name: '_pmCafe',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         // secure:true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// }

// app.uses
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
const secret = process.env.SESSION_SECRET

const sessionConfig = {
    secret,
    name: '_rolandOrtiz',
    resave: false,
    saveUninitialized: true,
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600 // time period in seconds
    }),
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
const frameSrcUrls=[
"https://js.stripe.com/",
"https://www.sandbox.paypal.com/",


]
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
"https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css",
    "https://cdn.ckeditor.com/",
    "https://cdnjs.cloudflare.com/",
    "https://ionic.io/ionicons/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://www.google-analytics.com",
    "https://code.jquery.com/",
    "https://fontawesome.com",
    "https://js.stripe.com/v3/",
    "https://www.paypal.com/sdk/js",
    "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",
    "https://api2.amplitude.com/",
    "https://unpkg.com/@barba/core",




];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
"https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css",
    "https://getbootstrap.com/",
    "https://use.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://ionic.io/ionicons/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://fontawesome.com",
 "https://api2.amplitude.com/",



];
const connectSrcUrls = [
    "https://unsplash.com/",
 "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
"https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css",
    "https://ionic.io/ionicons/",
    "https://unpkg.com/",
    "https://fontawesome.com",
    "https://ka-f.fontawesome.com/",
    "https://www.sandbox.paypal.com/xoplatform/logger/api/logger",
 "https://api2.amplitude.com/",

];
const fontSrcUrls = [
    "https://ionic.io/ionicons/",
 "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
"https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css",
    "https://fonts.gstatic.com/",
    "https://cdnjs.cloudflare.com/",
    "https://use.fontawesome.com/",
    "https://fontawesome.com",
    "https://ka-f.fontawesome.com/",
 "https://api2.amplitude.com/",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            formAction: ["'self'"],
            frameSrc:["'self'",...frameSrcUrls],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'",...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            mediaSrc: ["'self'"],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
                "https://images.unsplash.com/",
                "https://i.pinimg.com/564x/6c/bf/00/6cbf00a772725add422adf6bb976f6ba.jpg",
                "https://media.istockphoto.com/",
                "https://img.icons8.com/ios-glyphs/256/phone-disconnected.png",
                "https://source.unsplash.com/collection/10623559",
                "https://source.unsplash.com/collection/8657917",
                "https://www.paypalobjects.com/js-sdk-logos/2.2.7/paypal-blue.svg",
                "https://www.paypalobjects.com/js-sdk-logos/2.2.7/card-black.svg",
                "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(31).webp",
                "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/images/ui-icons_444444_256x240.png",





            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
app.use((req, res, next) => {
  res.setHeader('Set-Cookie', 'HttpOnly; Secure; SameSite=None');
  next();
});
app.use(cors())
app.use(express.json())
app.use(methodOverride('_method'));
//passport
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}
));
const GOOGLE_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));



app.use(flash());

app.use((req, res, next) => {
  res.locals.isAdmin = req.user && req.user.isAdmin === true;
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.isLoggedIn = req.user ? true : false;

  // Add the 'order' variable to res.locals
  if (req.user) {
    Order.findOne({ userID: req.user._id })
      .then(order => {
        res.locals.order = order;
        next();
      })
      .catch(error => {
        console.error(error);
        next(error);
      });
  } else {
    res.locals.order = null;
    next();
  }
});

// setting template
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/debug',cartMiddleware,  async(req, res) => {
   console.log(req.cart.cartProducts);
  res.send('Cart products logged in the console');
});



app.get('/privacypolicy', (req, res) => {
    res.render('partials/PrivacyPolicy')
})


app.post('/payment', async (req, res) => {
    const orderId = req.body.orderId;

    const order = await Order.findById(orderId);
    console.log(order);

    if (!order) {
        return res.status(404).send('Order not found.');
    }
    const successUrl = 'http://localhost:3000/success';
    const cancelUrl = 'http://localhost:3000/cancel';


    const unitAmount = Math.round(order.amount * 100);


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Order Payment',
                    },
                    unit_amount: unitAmount,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    res.json({ id: session.id });
});


const client_id = process.env.PAYPAL_CLIENT_ID;
const secret_key =   process.env.PAYPAL_SECRET_KEY


app.post('/create_order', async (req, res) => {
  try {
    const access_token = await get_access_token();

    if (req.body.orderId) {
      const order = await Order.findById(req.body.orderId);

      let order_data_json = {
        'intent': req.body.intent.toUpperCase(),
        'purchase_units': [{
          'reference_id': order._id, // Set the reference_id as the orderId from the Order model
          'amount': {
            'currency_code': currency,
            'value': order.totalPrice.toString() // Use the total price from the Order model
          }
        }]
      };

      const data = JSON.stringify(order_data_json);

      const response = await fetch(endpoint_url + '/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'Paypal-Request-Id': generateRandomUUIDv4()
        },
        body: data
      });

      const json = await response.json();
      res.send(json);
    } else {
      throw new Error('Expected an order ID to be passed');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});



app.post('/complete_order', (req,res)=>{
get_access_token()
.then(access_token =>{

fetch(endpoint_url + '/v2/checkout/orders' + req.body.order_id + '/' + req.body.intent, {
method:'POST', headers:{'Content-type': 'application/json','Authorization': `Bearer ${access_token}`}
})
.then(res => res.json())
.then(json => {res.send(json); })
})
.catch(err => {console.log(err); res.status(500).send(err)})
})


function generateRandomUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


function get_access_token(){
const auth =  `${client_id}:${secret_key}`
const data = `grant_type_client_credentials`
return fetch(endpoint_url + '/v1/oauth2/token',{
method: 'POST',
headers: {
'Content-type': 'application/x-www-form-urlencoded',
'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`
},
body:data
})
.then(res => res.json())
.then(json => {return json.access_token;})
}

app.get('/success', (req, res) => {
    res.render('payments/success')
})
app.get('/cancel', (req, res) => {
    res.render('payments/cancel')
})





app.use('/', homeRoute);
app.use('/', userRoute);
app.use('/', productRoute);
app.use('/', orderRoute);
app.use('/', cartRoute);
app.use('/', adminRoute);
app.use('/', paidRoute);
app.use('/', scheduleRoute);


app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to home page.
        res.redirect('/');
    });




app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!';
    res.status(statusCode).render('error', { err });
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
