/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET = process.env.SECRET_KEY || 'test';

const PORT = +process.env.PORT || 3001;

// database is:
// - on AWS, get from env var DATABASE_URL
// - in testing, 'key_blogger-test'
// - else: 'key_blogger'

let DB_URI;

if (process.env.NODE_ENV === "test") {
    DB_URI = "key_blogger_test";
} else {
    DB_URI = "https://key-blogger-backend.herokuapp.com" || 'key_blogger';
}

console.log("Using database", DB_URI);

module.exports = {
    SECRET,
    PORT,
    DB_URI,
};