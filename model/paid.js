const mongoose = require('mongoose');

const PaidSchema = new mongoose.Schema(
    {
        userID: {
            type: String,
            required: true,
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
        totalSales: {
            type: Number,
            required: true
        },
        address: {
            type: Object
        },
        status: {
            type: String,
            default: "pending",
        },
        receipt: String,

    },
    { timestamps: true }
)


module.exports = mongoose.model('Paid', PaidSchema);