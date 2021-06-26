/** Routes for posts. */

const express = require("express");
const router = new express.Router();

const { authRequired } = require("../middleware/auth");

const Post = require("../models/post");
const { validate } = require("jsonschema");
const { postNewSchema, postUpdateSchema } = require("../schemas");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../config");
const cors = require("cors");

/** GET / =>  {posts: {post: {}, post, {}}}   */
router.get("/", cors(), async function (req, res, next) {
    try {
        const posts = await Post.findRecent(req.query);
        return res.json({ posts });
    }
    catch (err) {
        return next(err);
    }
});

/** GET /[id]  =>  {post: post} */
router.get("/:id", cors(), async function (req, res, next) {
    try {
        const post = await Post.findOne(req.params.id);
        return res.json({ post });
    }
    catch (err) {
        return next(err);
    }
});

/** POST / {postData} =>  {post: newpost} */
router.post("/", cors(), authRequired, async function (req, res, next) {
    try {
        const validation = validate(req.body, postNewSchema);

        if (!validation.valid) {
            return next({
                status: 400,
                message: validation.errors.map(e => e.stack)
            });
        }

        const { username } = jwt.verify(req.body._token, SECRET);

        const post = await Post.create(req.body, username);
        return res.status(201).json({ post });   // 201 CREATED
    }
    catch (err) {
        return next(err);
    }
});

router.post("/:id/vote/:direction", cors(), async function (req, res, next) {
    try {
        let delta = req.params.direction === "up" ? +1 : -1;
        const result = await Post.vote(delta, req.params.id)
        return res.json(result);
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[title] {postData} => {post: updatedpost}  */
router.patch("/:id", cors(), async function (req, res, next) {
    try {
        const { username } = await Post.findOne(req.params.id);
        const token = jwt.verify(req.body._token, SECRET);
        if (username !== token.username) {
            throw new Error("Unauthorized");
        }

        const validation = validate(req.body, postUpdateSchema);
        if (!validation.valid) {
            return next({
                status: 400,
                message: validation.errors.map(e => e.stack)
            });
        }

        const blog = await Post.update(req.params.id, req.body);
        return res.json({ blog });
    }

    catch (err) {
        return next(err);
    }
});

/** DELETE /[title]  =>  {message: "Post deleted"}  */
router.delete("/:id", cors(), async function (req, res, next) {
    try {
        const { username } = await Post.findOne(req.params.id);
        const token = jwt.verify(req.body._token, SECRET);
        if (username !== token.username) {
            throw new Error("Unauthorized");
        }

        await Post.remove(req.params.id);
        return res.json({ message: "Post deleted" });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = router;