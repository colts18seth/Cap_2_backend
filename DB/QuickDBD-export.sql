DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS comments;

CREATE TABLE "users"
(
    "user_id" SERIAL,
    "username" text NOT NULL,
    "password" text NOT NULL,
    "email" text NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    CONSTRAINT "pk_User" PRIMARY KEY (
        "user_id"
     ),
    CONSTRAINT "uc_User_username" UNIQUE (
        "username"
    )
);

CREATE TABLE "blogs"
(
    "blog_id" SERIAL,
    "title" text NOT NULL,
    "votes" int NOT NULL,
    "user_id" int NOT NULL,
    CONSTRAINT "pk_Blog" PRIMARY KEY (
        "blog_id"
     ),
    CONSTRAINT "uc_Blog_title" UNIQUE (
        "title"
    )
);

CREATE TABLE "posts"
(
    "post_id" SERIAL,
    "title" text NOT NULL,
    "data" text NOT NULL,
    "time" text NOT NULL,
    "votes" int NOT NULL,
    "blog_id" int NOT NULL,
    "user_id" int NOT NULL,
    CONSTRAINT "pk_Post" PRIMARY KEY (
        "post_id"
     )
);

CREATE TABLE "comments"
(
    "comment_id" SERIAL,
    "text" text NOT NULL,
    "user_id" int NOT NULL,
    "post_id" int NOT NULL,
    CONSTRAINT "pk_Comment" PRIMARY KEY (
        "comment_id"
     )
);

ALTER TABLE "blogs" ADD CONSTRAINT "fk_Blog_userId" FOREIGN KEY("user_id")
REFERENCES "users" ("user_id");

ALTER TABLE "posts" ADD CONSTRAINT "fk_Post_blogId" FOREIGN KEY("blog_id")
REFERENCES "blogs" ("blog_id");

ALTER TABLE "posts" ADD CONSTRAINT "fk_Post_userId" FOREIGN KEY("user_id")
REFERENCES "users" ("user_id");

ALTER TABLE "comments" ADD CONSTRAINT "fk_Comment_userId" FOREIGN KEY("user_id")
REFERENCES "users" ("user_id");

ALTER TABLE "comments" ADD CONSTRAINT "fk_Comment_postId" FOREIGN KEY("post_id")
REFERENCES "posts" ("post_id");