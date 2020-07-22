const express = require("express");
const logger = require("../logger");
const { v4: uuid } = require("uuid");
const bookmarks = require("../store");
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const BookmarksService = require("../bookmarks-service");

bookmarksRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    BookmarksService.getAllBookmarks(knexInstance)
      .then((bookmark) => {
        res.json(bookmark);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res) => {
    const { title, url } = req.body;
    if (!title) {
      logger.error("Title is required.");
      return res.status(400).send("Invalid Title");
    }
    if (!url) {
      logger.error("URL is required.");
      return res.status(400).send("Invalid URL");
    }
    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
    };
    bookmarks.push(bookmark);
    logger.info(`Bookmark with id:${id} created`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route("/:id")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    BookmarksService.getById(knexInstance, req.params.id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id:${req.params.id} not found.`);
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` },
          });

        }
        res.json(bookmark);
      })
      .catch(next);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex(
      (book) => book.id.toString() === id
    );
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id:"${id}" not found.`);
      res.status(404).send("Bookmark not found.");
    }
    bookmarks.splice(bookmarkIndex, 1);
    logger.info(`Bookmark with id:"${id}" was deleted.`);
    res.status(200).send(`Bookmark with id:"${id}" was deleted.`);
  });

module.exports = bookmarksRouter;
