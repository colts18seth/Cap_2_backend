const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const moment = require("moment");

// Related functions for posts.
class Post {

    // Create a post (from data), update db, return new post data.
    static async create(data) {
        const result = await db.query(
            `INSERT INTO posts (title, data, time, votes, blog_id, user_id) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING title, data, time, votes, blog_id, user_id`,
            [data.title, data.data, moment().format('MMMM Do YYYY, h:mm:ss a'), data.votes || 0, data.blog_id, data.user_id]
        );

        return result.rows[0];
    }

    /** Find all post from a blog. */
    static async findAll(blog_id) {
        const result = await db.query(
            `SELECT p.title, p.data, p.time, p.votes, b.title AS blog_title, u.username
                    FROM posts AS p
                    INNER JOIN blogs AS b ON p.blog_id=b.blog_id
                    INNER JOIN users AS u ON p.user_id=u.user_id
                    WHERE b.blog_id = $1`,
            [blog_id]);

        return result.rows;
    }

    /** Given a post id, return data about post. */
    static async findOne(title) {
        const postRes = await db.query(
            `SELECT p.title, p.data, p.time, p.votes, b.title AS blog_title, u.username
                FROM posts AS p
                INNER JOIN blogs AS b ON p.blog_id=b.blog_id
                INNER JOIN users AS u ON p.user_id=u.user_id
                WHERE p.title = $1`,
            [title]);

        const post = postRes.rows[0];

        if (!post) {
            const error = new Error(`There exists no post '${title}'`);
            error.status = 404;   // 404 NOT FOUND
            throw error;
        }

        return post;
    }

    static async vote(delta, id) {
        const currVotes = await db.query(
            "SELECT votes from posts WHERE post_id = $1",
            [id]);

        if (currVotes.rows[0].votes === 0 && delta === -1) {
            return 0;
        } else {
            const result = await db.query(
                "UPDATE posts SET votes=votes + $1 WHERE post_id = $2 RETURNING votes",
                [delta, id]);

            return result.rows[0];
        }
    }

    /** Update post data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Return data for changed post.
     *
     */
    static async update(title, data) {
        let { query, values } = sqlForPartialUpdate(
            "posts",
            data,
            "title",
            title
        );

        const result = await db.query(query, values);
        const post = result.rows[0];

        if (!post) {
            let notFound = new Error(`There exists no post '${title}`);
            notFound.status = 404;
            throw notFound;
        }

        return post;
    }

    /** Delete given post from database; returns undefined. */
    static async remove(title) {
        const result = await db.query(
            `DELETE FROM posts 
            WHERE title = $1 
            RETURNING title`,
            [title]);

        if (result.rows.length === 0) {
            let notFound = new Error(`There exists no post '${title}`);
            notFound.status = 404;
            throw notFound;
        }
    }
}

module.exports = Post;