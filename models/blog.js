const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


/** Related functions for blogs. */
class Blog {

    /** Find all blogs. */
    static async findAll(query) {
        let baseQuery = `SELECT * FROM blogs INNER JOIN users ON blogs.user_id=users.user_id`;
        let whereExpressions = [];
        let queryValues = [];

        // For each possible search term, add to whereExpressions and
        // queryValues so we can generate the right SQL

        if (query) {
            console.log(query)
            if (query.search) {
                queryValues.push(`%${query.search}%`);
                whereExpressions.push(`title ILIKE $${queryValues.length}`);
            } else if (query.filter) {
                queryValues.push(`%${query.filter}%`);
                whereExpressions.push(`username ILIKE $${queryValues.length}`);
            }
        }

        if (whereExpressions.length > 0) {
            baseQuery += " WHERE ";
        }

        // Finalize query and return results

        let finalQuery = baseQuery + whereExpressions.join(" AND ") + " ORDER BY title";
        const blogsRes = await db.query(finalQuery, queryValues);
        return blogsRes.rows;

        // const result = await db.query(
        //     `SELECT *
        //       FROM blogs
        //       INNER JOIN users ON blogs.user_id=users.user_id
        //       `);

        // return result.rows;
    }

    /** Given a blog title, return data about blog. */
    static async findOne(title) {
        const blogRes = await db.query(
            `SELECT *
                FROM blogs AS b
                JOIN users AS u ON b.user_id=u.user_id
                WHERE b.title = $1`,
            [title]);

        const blog = blogRes.rows[0];

        if (!blog) {
            const error = new Error(`There exists no blog '${title}'`);
            error.status = 404;   // 404 NOT FOUND
            throw error;
        }

        const blogPostsRes = await db.query(
            `SELECT *
               FROM blogs AS b
                 JOIN posts AS p ON b.blog_id = p.blog_id
               WHERE b.title = $1`,
            [title]);

        blog.posts = blogPostsRes.rows;
        return blog;
    }

    /** Create a blog, update db, return new blog. */
    static async create(data, username) {
        const duplicateCheck = await db.query(
            `SELECT * 
            FROM blogs 
            WHERE title = $1`,
            [data.title]);

        if (duplicateCheck.rows[0]) {
            let duplicateError = new Error(
                `There already exists a blog with title '${data.title}`);
            duplicateError.status = 409; // 409 Conflict
            throw duplicateError
        }

        const user = await db.query(
            `SELECT user_id
            FROM users
            WHERE username = $1`,
            [username]);
        const { user_id } = user.rows[0];

        const result = await db.query(
            `INSERT INTO blogs 
              (title, user_id, votes)
            VALUES ($1, $2, $3) 
            RETURNING title`,
            [
                data.title,
                user_id,
                0
            ]);

        return result.rows[0];
    }

    static async vote(delta, id) {
        const result = await db.query(
            "UPDATE blogs SET votes=votes + $1 WHERE blog_id = $2 RETURNING votes",
            [delta, id]);

        return result.rows[0];
    }

    /** Update blog data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the fields; this only changes provided ones.
     *
     * Return data for changed blog.
     *
     */
    static async update(title, data) {
        let { query, values } = sqlForPartialUpdate(
            "blogs",
            data,
            "title",
            title
        );

        const result = await db.query(query, values);
        const blog = result.rows[0];

        if (!blog) {
            let notFound = new Error(`There exists no blog '${title}`);
            notFound.status = 404;
            throw notFound;
        }

        return blog;
    }

    /** Delete given blog from database; returns undefined. */
    static async remove(title) {
        const result = await db.query(
            `DELETE FROM blogs 
          WHERE title = $1 
          RETURNING title`,
            [title]);

        if (result.rows.length === 0) {
            let notFound = new Error(`There exists no blog '${title}`);
            notFound.status = 404;
            throw notFound;
        }
    }
}


module.exports = Blog;
