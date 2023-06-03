// router.get('/cart', async (req, res) => {
//     try {
//         const userID = req.params.id; // Assuming you have user authentication and can access the user ID
//         const cart = await Cart.findOne({ userID }).populate('products.product');

//         if (!cart) {
//             req.flash('error', 'Cart not found');
//             return res.redirect('/products');
//         }
//         let totalPrice = 0;
//         const cartProducts = cart.products.map((item) => {
//             const productTotalPrice = item.quantity * item.product.price
//             totalPrice += productTotalPrice
//             return {
//                 product: item.product._id,
//                 quantity: item.quantity,
//                 title: item.product.title,
//                 price: item.product.price,
//                 category: item.product.category,
//                 image: item.product.image,
//                 productTotalPrice
//                 // Add other product details you want to display in the cart
//             };
//         });

//         res.render('cart/cart', { cartProducts, cart, totalPrice });
//     } catch (error) {
//         console.error(error);
//         req.flash('error', 'An error occurred');
//         res.redirect('/cart');
//     }
// });

router.get('/', async (req, res) => {
    try {
        const userID = req.params.id; // Assuming you have user authentication and can access the user ID
        const cart = await Cart.findOne({ userID }).populate('products.product');

        if (!cart) {
            req.flash('error', 'Cart not found');
            return res.redirect('/products');
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
                image: item.product.image,
                productTotalPrice
                // Add other product details you want to display in the cart
            };
        });

        res.render('home', { cartProducts, cart, totalPrice });
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred');
        return res.redirect('/products');
    }
});
