const User = require('./model/user')
const Cart = require('./model/cart')
const Product = require('./model/product')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {

        req.flash('error', 'You must login first');
        return res.redirect('/login')
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const userId = req.user._id; // Assuming the user ID is stored in req.user._id
    const currentRoute = req.originalUrl;

    if (currentRoute === '/') {
        return next(); // Skip the check if already on the / page
    }

    const cart = await Cart.findOne({ userID: userId });

    if (!cart || !cart.userID.equals(userId)) {
        const newCart = new Cart({
            userID,
            products: [{ product: productId, quantity: parsedQuantity }],
        });
        await newCart.save();
    }

    next();
};




module.exports.isAdmin = async (req, res, next) => {
    try {
        const currentUser = req.user;

        if (!currentUser || !currentUser.isAdmin) {
            req.flash('error', 'authorized person only!');
            return res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        if (error.details && Array.isArray(error.details)) {
            const msg = error.details.map((el) => el.message).join(',');
            throw new ExpressError(msg, 500);
        } else {
            throw error;
        }
    }
};



module.exports.sendEmailReg = async (req, res, next) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_EMAIL_PASSWORD,
        },
    });

    try {

        const secret = process.env.JWT_SECRET + process.env.ADMIN_ROUTE;
        const payload = {
            pass: process.env.JWT_PASS,
            route: process.env.ADMIN_ROUTE,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "360s" });
        const link = `http://${req.headers.host}/registration/${token}`;
        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: process.env.GMAIL_EMAIL,
            subject: "Register attempt",
            html: `A user is trying to register, If it is you click this link to continue logging in ${link}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal server error");
            } else {
                next();
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
};


module.exports.cartMiddleware = async (req, res, next) => {
    try {

        let userID;
        let cart;

        if (req.user) {
            userID = req.user._id;
            cart = await Cart.findOne({ userID }).populate('products.product');
        } else {

            userID = req.session.sessionID;
            cart = await Cart.findOne({ userID }).populate('products.product');
        }

        if (!cart) {
            cart = new Cart({ userID, products: [] });
            await cart.save();
        }

        let totalPrice = 0;
        const cartProducts = cart.products.map((item) => {
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
        cart.totalPrice = totalPrice.toFixed(2); // Set the total price of the cart
        await cart.save();

        req.cart = { cartProducts, cart, totalPrice };
        next();
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred');
        res.redirect('/cart');
    }
};

// CARTS
module.exports.createCart = async (req, res, next) => {
    try {

        const userID = req.user._id;
        const { quantity } = req.session;
        const productId = req.params.id;
        let parsedQuantity = parseInt(quantity, 10);


        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            parsedQuantity = 1;
        }

        // Find the cart for the given user ID
        const cart = await Cart.findOne({ userID });

        if (!cart) {
            const newCart = new Cart({
                userID,
                products: [{ product: productId, quantity: parsedQuantity }],
            });
            await newCart.save();
        } else {
            // Retrieve the product details from the database
            const product = await Product.findById(productId);

            if (!product) {
                req.flash('error', 'Product not found');
                return res.redirect('/products');
            }

            const existingProduct = cart.products.find(
                (cartProduct) => cartProduct.product.toString() === productId
            );


            // Product checking
            if (existingProduct) {
                // update quantity
                existingProduct.quantity += parsedQuantity;
            } else {
                // If the product doesn't exist in the cart, add it
                cart.products.push({ product: productId, quantity: parsedQuantity });
            }

            await cart.save();
            req.cart = {
                cartProducts: cart.products,
                cart,
                totalPrice: cart.totalPrice,
            };

            req.flash('success', `${product.title} added to your cart`);
        }

        req.session.returnTo = req.headers.referer || '/';


        return next();
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred');
        res.redirect('/products');
    }

}

module.exports.updateCart = async (req, res, next) => {
  try {
    const userID = req.user._id;

    // Find the cart for the given user ID
    const cart = await Cart.findOne({ userID });

    if (!cart) {
      const newCart = new Cart({
                userID,
                products: [{ product: productId, quantity: parsedQuantity }],
            });
            await newCart.save();
    }

    const updatedProducts = req.cart.cartProducts;
    cart.products = updatedProducts;

    // Save the updated cart
    await cart.save();

    return next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the cart' });
  }
};


module.exports.cartUpdate = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const originalQuantity = parseInt(req.body.originalQuantity, 10);
        const productId = req.params.productId;
        const parsedQuantity = parseInt(quantity, 10);

        // Find the cart for the given user ID
        const cart = await Cart.findOne({ userID: req.user._id });

        if (!cart) {
            req.flash('error', 'Cart not found');
            return next();
        }

        // Find the product in the cart
        const cartProduct = cart.products.find(
            (product) => product.product.toString() === productId
        );

        if (!cartProduct) {

            return next();
        }

        // Update the quantity
        cartProduct.quantity = parsedQuantity;
        await cart.save();

        // Store the original URL in the session
        req.session.returnTo = req.headers.referer || '/';

        // Continue with the next middleware or respond with a success message
        return next();
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred');
        res.redirect('/');
    }
};





module.exports.productDelete = async (req, res, next) => {
    try {
        const userID = req.user._id;
        const productId = req.params.productId;
        const cart = await Cart.findOne({ userID });

        if (!cart) {
            req.flash('error', 'Cart not found');
            return next();
        }

        const productIndex = cart.products.findIndex(
            (product) => product.product.toString() === productId
        );

        if (productIndex === -1) {
            return next();
        }

        cart.products.splice(productIndex, 1);

        if (cart.products.length === 0) {
            // If the cart becomes empty, save it without any products
            cart.products = [];
        }

        await cart.save();

        req.session.returnTo = req.headers.referer || '/';
        return next();
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred');
        res.redirect('/');
    }
};





