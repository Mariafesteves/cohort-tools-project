const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config();



const { isAuthenticated } = require("../middleware/middleware/jwt.middleware");

const User = require("../models/userModel");

const router = express.Router()

const saltRounds = 10;


router.post('/signup', (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        res.status(400).json({ message: 'Provide email, password and name' })
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Provide a valid email address.' });
        return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
        return;
    }

    User.findOne({ email })
        .then((foundUser) => {
            if (foundUser) {
                res.status(400).json({ message: "User already exists." })
                return;
            }

            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(password, salt);
            const newUser = {
                email: email,
                password: hashedPassword,
                name: name
            };

            return User.create(newUser);
        })

        .then((createdUser) => {
            const { email, name, _id } = createdUser;

            const user = { email, name, _id };

            res.status(201).json({ user: user });
        })

        .catch(err => {
            console.log("Error trying to create an account...\n\n", err);
            res.status(500).json({ message: "Internal Server Error" })
        })

});


router.post('/login', (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Provide email and password." });
        return;
    }

    User.findOne({ email })
        .then((foundUser) => {

            if (!foundUser) {
                res.status(401).json({ message: "User not found." })
                return;
            }

            const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

            if (passwordCorrect) {
                const { _id, email, name } = foundUser;

                const payload = { _id, email, name };

                if (!process.env.TOKEN_SECRET) {
                    console.error("TOKEN_SECRET is not defined in the environment variables.");
                    res.status(500).json({ message: "Internal Server Error" });
                    return;
                }

                const authToken = jwt.sign(
                    payload,
                    process.env.TOKEN_SECRET,
                    { algorithm: 'HS256', expiresIn: "8h" }
                )

                res.json({ authToken: authToken });
            }

            else {
                res.status(401).json({ message: "Unable to authenticate the user" });
                return;
            }
        })

        .catch(err => {
            console.log("Error trying to login...\n\n", err);
            res.status(500).json({ message: "Internal Server Error" })
        });

});

router.get('/verify', isAuthenticated, (req, res, next)=>{
    console.log(`req.payload`, req.payload);

    res.json(req.payload)
});

module.exports= router;