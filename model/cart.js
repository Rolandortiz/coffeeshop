const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CartSchema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    default: 1,
                }
            },
        ],
        totalPrice: Number
    },
    { timestamps: true }
)
// Define a method to update the quantity of a product in the cart
CartSchema.methods.updateProductQuantity = function (productId, quantity) {
    const cartProduct = this.products.find(
        (product) => product.product.toString() === productId
    );

    if (cartProduct) {
        cartProduct.quantity = quantity;
        this.markModified('products'); // Mark 'products' field as modified
    }
};

module.exports = mongoose.model('Cart', CartSchema);