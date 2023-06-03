const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ProductSchema = new Schema(
    {
        title: {
            type: String,


        },
        description: {
            type: String,

        },
        image: {
            type: String,


        },
        category: {
            type: Array,

        },
        price: {
            type: Number,


        },
        size: {
            type: String,
        },


    },
    { timestamps: true }
)


module.exports = mongoose.model('Product', ProductSchema);