const dotenv = require('dotenv').config({ override: true });
const express = require('express')
const router = express.Router();
const User = require('../model/user');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const mongoose = require('mongoose')
const catchAsync = require('../utils/catchasync');
const { sendEmailReg } = require('../middleware')
const { storage } = require('../cloudinary');
const { cloudinary } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage })




// Profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'There is no user found');
      return res.redirect('/');
    }
const currentUser = req.user;
    res.render('user/profile', { user, currentUser });
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred');
    res.redirect('/');
  }
});

router.get('/profile/:id/edit', async(req,res)=>{
try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'There is no user found');
      return res.redirect('/');
    }
    res.render('user/edit', { user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred');
    res.redirect('/');
  }

})


router.put('/profile/:id', upload.array('image'), catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, {...req.body.user});
const imgs = req.files.map(i => ({ url: i.path, filename: i.filename }));
    user.images.push(...imgs);
    await user.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await user.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await user.save();
    req.flash('success', 'Product updated')
    res.redirect(`/profile/${user._id}`)

}))

// customer registration

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password, fullname, number, address } = req.body;

        const passwordRegix = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegix.test(password)) {
            req.flash('error', 'It must contain atleast 1 Uppercase 1 number');
            return res.redirect('/login')
        }
        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            req.flash('error', 'A user with the given username is already registered')
            return res.redirect('/login')
        }
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            req.flash('error', 'A user with the given email is already registered')
            return res.redirect('/login')
        }
        const existingNumber = await User.findOne({ number })
        if (existingNumber) {
            req.flash('error', 'A user with the given Number is already registered')
            return res.redirect('/login')
        }
        const confirmPassword = req.body['confirm-password'];
        if (password !== confirmPassword) {
            req.flash('error', 'Password do not match');
            return res.redirect('/login');
        } else {
            const user = new User({ email, username, fullname, number, address });
            const registeredUser = await User.register(user, password)
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('success', `Welcome to Cafe ${username}`)
                res.redirect('/')
            })

        }
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/login')
    }
}))

// admin registration

router.get('/adminregister', sendEmailReg, (req, res) => {
    res.redirect('/')
})


router.get('/registration/:url', (req, res) => {
    res.render('user/adminregister')
})


router.post('/adminregister', catchAsync(async (req, res) => {
    try {
        const { email, username, password, isAdmin, fullname, number, address } = req.body;

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long');
            res.redirect('/registration/:url');
            return;
        }
        const isAdminBool = isAdmin === 'true';
        const user = new User({ email, username, isAdmin: isAdminBool, fullname, number, address });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Cafe ${username}`)
            res.redirect('/')
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/registration/:url');
    }
}));


router.get('/login', (req, res) => {
    res.render('user/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), async (req, res) => {
    try {
        const { username } = req.body;


        const user = await User.findOne({ username });
if(user.isAdmin == false){
        user.interactions += 1;
        await user.save();
}
  if (user) {
      user.isLoggedIn = true; // Set isLoggedIn to true
      await user.save();
    }
        req.flash('success', `Welcome back ${username}`);
        res.redirect('/');
    } catch (err) {
        console.log(err.message);
        res.status(500).send('An error occurred during login.');
    }
});



// router.get('/auth/facebook', passport.authenticate('facebook', {
//     scope: ['public_profile', 'email']
// }));
router.get('/auth/facebook', (req, res, next) => {
    if (req.user) {
        res.redirect('/');
    } else {
        passport.authenticate('facebook', { scope: ['public_profile', 'email'] })(req, res, next);
    }
});



router.get('/auth/facebook/callback', passport.authenticate('facebook', { keepSessionInfo: true, failureRedirect: '/login' }), (req, res) => {


req.flash('success', 'Welcome to Paulamed Cafe');
    res.redirect('/')
});


router.get('/auth/google', (req, res, next) => {
    if (req.user) {
        res.redirect('/');
    } else {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    }
});
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        req.flash('success', 'Welcome to Shadowies Cafe');
        res.redirect('/');
    });

router.get('/forgot-password', (req, res) => {
    res.render('user/forget');
});


router.post('/forgot-password', catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const registeredUser = await User.findOne({ email });
    if (!registeredUser) {
        req.flash('error', 'User not registered');
        res.redirect('/forgot-password');
        return;
    }

    const secret = process.env.JWT_SECRET + registeredUser.password;
    const payload = {
        email: registeredUser.email,
        id: registeredUser._id.toString(),
    };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    const resetPasswordLink = `http://${req.headers.host}/reset-password/${registeredUser._id}/${token}`;

    const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: registeredUser.email,
        subject: 'Password Reset',
        text: `You are receiving this email because you (or someone else) have requested a password reset for your account.
  Please click on the following link, or paste this into your browser to complete the process:
  ${resetPasswordLink}
  If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    console.log('Sending email to: ', registeredUser.email);

    smtpTransport.sendMail(mailOptions, (err, info) => {
        if (err) {
            req.flash('error', `An error occurred while sending the password reset email: ${err.message}`);
            console.error('Error sending email: ', err);
            return next(err);
        }
    });

    req.flash('success', 'An email has been sent to your registered email address with instructions on how to reset your password.');
    res.redirect('/forgot-password');
}));


router.get('/reset-password/:id/:token', catchAsync(async (req, res) => {
    const { id, token } = req.params;

    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'Invalid ID');
        res.redirect('/forgot-password');
        return;
    }

    const secret = process.env.JWT_SECRET + user.password;
    try {
        const payload = await jwt.verify(token, secret);
        res.render('user/reset-password', { email: user.email, id, token });
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'Something went wrong');
        res.redirect('/forgot-password');
    }
}));

router.post('/reset-password/:id/:token', catchAsync(async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'Invalid ID');
        res.redirect('/forgot-password');
        return;
    }
    const passwordRegix = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegix.test(password)) {
        req.flash('error', 'It must contain atleast 1 Uppercase 1 number');
        return res.redirect(`/reset-password/${user._id}/${token}`)
    } const confirmPassword = req.body['confirm-password'];

    if (password !== confirmPassword) {
        req.flash('error', 'Password do not match');
        return res.redirect(`/reset-password/${user._id}/${token}`);
    } else {

        const secret = process.env.JWT_SECRET + user.password;
        try {
            const payload = await jwt.verify(token, secret, { expiresIn: '1d' });
            await user.setPassword(password);
            await user.save();
            req.flash('success', 'Your password has been successfully reset.');
            res.redirect('/login');
        } catch (error) {
            console.log(error.message);
            req.flash('error', 'Something went wrong');
            res.redirect('/forgot-password');
        }
    }
}));



router.get('/logout', async (req, res, next) => {
    try {
        if (req.user) {
            await User.findOneAndUpdate(
                { _id: req.user._id }, // Find the user by their ID
                { isLoggedIn: false } // Set isLoggedIn to false
            );
        }

        req.logout(function (err) {
            if (err) { return next(err); }
            req.flash('success', "Goodbye!");
            res.redirect('/');
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('An error occurred during logout.');
    }
});

module.exports = router;

