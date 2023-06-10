const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const imageSchema = new Schema({
url:String,
filename:String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_200');
})
const opts = { toJSON: { virtuals: true } };
const ProductSchema = new Schema(
    {
        title: {
            type: String,


        },
        description: {
            type: String,

        },
        images: [imageSchema],
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
    { timestamps: true },
 opts
)


module.exports = mongoose.model('Product', ProductSchema);