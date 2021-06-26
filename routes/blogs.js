/** Routes for companies. */

const express = require("express");
const router = new express.Router();

const { authRequired } = require("../middleware/auth");

const Blog = require("../models/blog");
const { validate } = require("jsonschema");
const { blogNewSchema, blogUpdateSchema } = require("../schemas");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../config");
const cors = require("cors");


/** GET /  =>  {blogs: [blog, blog]}  */
router.get("/", cors(), async function (req, res, next) {
    try {
        const blogs = await Blog.findAll(req.query);
        return res.json({ blogs });
    }
    catch (err) {
        return next(err);
    }
});


/** GET /[id]  =>  {blog: blog} */
router.get("/:id", cors(), async function (req, res, next) {
    try {
        const blog = await Blog.findOne(req.params.id);
        return res.json({ blog });
    }
    catch (err) {
        return next(err);
    }
});

/** POST / {blogData} =>  {blog: newBlog} */
router.post("/", cors(), authRequired, async function (req, res, next) {
    try {
        const validation = validate(req.body, blogNewSchema);

        if (!validation.valid) {
            return next({
                status: 400,
                message: validation.errors.map(e => e.stack)
            });
        }

        const { username } = jwt.verify(req.body._token, SECRET);

        const blog = await Blog.create(req.body, username);
        return res.status(201).json({ blog });   // 201 CREATED
    }
    catch (err) {
        return next(err);
    }
});

router.post("/:id/vote/:direction", cors(), async function (req, res, next) {
    try {
        let delta = req.params.direction === "up" ? +1 : -1;
        const result = await Blog.vote(delta, req.params.id)
        return res.json(result);
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[title] {blogData} => {blog: updatedblog}  */
router.patch("/:id", cors(), async function (req, res, next) {
    try {
        const { username } = await Blog.findOne(req.params.id);
        const token = jwt.verify(req.body._token, SECRET);
        if (username !== token.username) {
            throw new Error("Unauthorized");
        }

        const validation = validate(req.body, blogUpdateSchema);
        if (!validation.valid) {
            return next({
                status: 400,
                message: validation.errors.map(e => e.stack)
            });
        }

        const blog = await Blog.update(req.params.id, req.body);
        return res.json({ blog });
    }

    catch (err) {
        return next(err);
    }
});


/** DELETE /[title]  =>  {message: "Blog deleted"}  */
router.delete("/:id", cors(), async function (req, res, next) {
    try {
        const { username } = await Blog.findOne(req.params.id);
        const token = jwt.verify(req.body._token, SECRET);
        if (username !== token.username) {
            throw new Error("Unauthorized");
        }

        await Blog.remove(req.params.id);
        return res.json({ message: "Blog deleted" });
    }
    catch (err) {
        return next(err);
    }
});


module.exports = router;