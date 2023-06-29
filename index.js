//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Welcome to my blog website! Here you can read my posts and create your own by adding /compose to the URL. The posts are stored in a MongoDB database.";
const aboutContent = "This website is inspired by a Web Development course on Udemy from Dr. Angela Yu. It is a blog website where you can create posts and read them. The posts are stored in a MongoDB database. The website is hosted on render";
const contactContent1 = "email: miska.forman@gmail.com";
const contactContent2 = "phone: +420 725 156 586";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.set("strictQuery", false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Create Schema
const postSchema = {
    title: String,
    content: String
}

// Create Model
const Post = mongoose.model("Post", postSchema);

app.get("/", async function (req, res) {
    try {
        const posts = await Post.find({});

        if (posts.length === 0) {
            res.render("home", {startingContent: homeStartingContent, posts: []});
        } else {
            res.render("home", {startingContent: homeStartingContent, posts: posts});
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
});

app.get("/about", function (req, res) {
    res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function (req, res) {
    res.render("contact", {contactContent1: contactContent1, contactContent2: contactContent2});
});

app.get("/compose", function (req, res) {
    res.render("compose");
});

app.post("/compose", function (req, res) {

    const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody
    });

    post.save();

    res.redirect("/");

});

app.get("/posts/:postID", async function (req, res) {
    const requestedID = (req.params.postID);

    try {
        const correctPost = await Post.findById(requestedID);
        console.log(correctPost);
        res.render("post", {post: correctPost});
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
});

connectDB().then(() => {
    app.listen(PORT, function () {
        console.log(`Server started on port ${PORT}`);
    });
});
