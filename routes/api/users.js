const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Load model
const User = require('../../models/User');
const Token = require('../../models/Token');

// Load input validation
const valRegisterInput = require('../../lib/validation/valRegister');
const valLoginInput = require('../../lib/validation/valLogin');

// Load secretOrKey for jwt
const secretOrKey = require('../../config/settings').secretOrKey;

/**
 * @route GET api/users/test.
 * @desc Test users route
 * @access Public
 */
router.get('/test', (req, res) => res.json({ msg: 'Users api works' }));

/**
 * @route GET api/users/signup.
 * @desc User sign-up for authentication
 * @access Public
 */
router.post('/register', (req, res) => {
    const { errors, isValid } = valRegisterInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            bcrypt.genSalt(16, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save(err => {
                            const token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                            token.save(err => {
                                if (err) {
                                    return res.status(500).send({ msg: err.message });
                                }
                                const transporter = nodemailer.createTransport({
                                    host: 'smtp.google.com',
                                    port: 25,
                                    secure: false,
                                    auth: {
                                        user: testUser,
                                        pass: testPass
                                    }
                                });
                                const mailOptions = {
                                    from: 'no-reply@talkable.com',
                                    to: user.email,
                                    subjet: 'Verification Token for Talkable',
                                    text: 'Hello,\n\n' + 'Please verify your registration by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n'
                                };
                                transporter.sendMail(mailOptions, (err) => {
                                    if (err) {
                                        return res.status(500).send({ msg: err.message });
                                    }
                                    res.status(200).json({ msg: 'Verification email sent to ' + user.email });
                                });
                            });
                        })
                        .then(user => res.json(user))
                        .catch(err => console.log(err))
                });
            });
        }
    });
});

// Oauth user data comes to these redirectURL
router.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    console.log(req.user);
    let token = jwt.sign({
        data: req.user
    }, secretOrKey, { expiresIn: 600 }); // expiry in seconds
    //res.cookie('jwt', 'Bearer' + token);
    //res.redirect('/api/users/test');
    res.json({ token: 'Bearer ' + token });
});

/**
 * @route GET api/users/current.
 * @desc Show info of current user
 * @access Private
 */
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        console.log(req.user);
        res.json({
            name: req.user.name,
        });
    }
);

module.exports = router;