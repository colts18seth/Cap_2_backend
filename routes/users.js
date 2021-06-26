/** Routes for users. */

const express = require("express");
const router = express.Router();
const cors = require("cors");

const User = require("../models/user");
const { validate } = require("jsonschema");

const { userNewSchema } = require("../schemas");

const createToken = require("../helpers/createToken");

/** GET /[username] => {user: user} */
router.get("/:username", cors(), async function (req, res, next) {
    try {
        const user = await User.findOne(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** POST / {userdata}  => {token: token} */
router.post("/", cors(), async function (req, res, next) {
    try {
        delete req.body._token;
        const validation = validate(req.body, userNewSchema);

        if (!validation.valid) {
            return next({
                status: 400,
                message: validation.errors.map(e => e.stack)
            });
        }

        const newUser = await User.register(req.body);
        const token = createToken(newUser);
        return res.status(201).json({ token, username: newUser.username });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
