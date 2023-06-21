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
    res.redirect(`/#review-section`);
}))


router.delete('/:id',isOwner,isAdmin, catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted')
    res.redirect(`/`);
}))


router.post("/review/:id/like", isLoggedIn, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    const foundUserLike = review.likes.some((like) => {
      return like.equals(req.user._id);
    });

    if (foundUserLike) {
      // user already liked, removing like
      review.likes.pull(req.user._id);
    } else {
      // adding the new user like
      review.likes.push(req.user);
    }

    await review.save(); // Await the save operation

    const updatedReview = await Review.findById(req.params.id).populate('likes'); // Fetch the updated review with populated likes

    const likeCount = updatedReview.likes.length;
    const isLiked = foundUserLike;

    return res.json({ likeCount, isLiked }); // Return likeCount and isLiked values in the response
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
});

module.exports = router;