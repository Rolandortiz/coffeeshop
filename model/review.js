const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const reviewSchema = new Schema({
    body: String,
    rating: Number,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
     },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},{timestamps:true});

reviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Review", reviewSchema);