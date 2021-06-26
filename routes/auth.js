/** Routes for authentication. */

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const createToken = require("../helpers/createToken");
const cors = require("cors");

router.post("/login", cors(), async function (req, res, next) {
    try {
        const user = await User.authenticate(req.body);
        const token = createToken(user);
        return res.json({ token, username: user.username });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;