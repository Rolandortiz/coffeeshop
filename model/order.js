const mongoose = require('mongoose');



const OrderSchema = new mongoose.Schema(
    {
        userID: {
             type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    default: 1,
                }
            },
        ],
        amount: {
            type: Number,

        },
        address: {
            type: Object
        },
        status: {
            type: String,
            default: "pending",
        },
        receipt: String

    },
    { timestamps: true }
)


module.exports = mongoose.model('Order', OrderSchema);