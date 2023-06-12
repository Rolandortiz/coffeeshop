const Review = require('../model/review');
const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchasync');
const { isAdmin, isLoggedIn, isOwner} = require('../middleware');



router.post('/review', isLoggedIn,catchAsync(async (req, res) => {
    const review = new Review(req.body.review);
    review.owner = req.user._id;
    await review.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/`);
}))


router.delete('/:id',isOwner,isAdmin, catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted')
    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router;