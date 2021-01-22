/** Express app for Key_Blogger. */

const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(cors());

// logging system
const morgan = require("morgan");
app.use(morgan("tiny"));

const usersRoutes = require("./routes/users");
const blogsRoutes = require("./routes/blogs");
const postsRoutes = require("./routes/posts");
const authRoutes = require("./routes/auth");

app.options('*', cors())
app.use("/users", usersRoutes);
app.use("/blogs", blogsRoutes);
app.use("/posts", postsRoutes);
app.use("/", authRoutes);

/** 404 handler */
app.use(function (req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;

    // pass the error to the next piece of middleware
    return next(err);
});

/** general error handler */
app.use(function (err, req, res, next) {
    if (err.stack) console.log(err.stack);

    res.status(err.status || 500);

    return res.json({
        error: err,
        message: err.message
    });
});

module.exports = app;