const express = require('express')
const logger = require('../logger')
const { v4: uuid } = require('uuid')
const bookmarks = require('../store')
const bookmarksRouter = express.Router()
const bodyParser = express.json()


bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url } = req.body;
        if (!title) {
            logger.error('Title is required.')
            return res.status(400).send('Invalid Title')
        }
        if (!url) {
            logger.error('URL is required.')
            return res.status(400).send('Invalid URL')
        }
        const id = uuid()
        const bookmark = {
            id,
            title,
            url
        }
        bookmarks.push(bookmark);
        logger.info(`Bookmark with id:${id} created`)
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
    })
    
bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(book => book.id === Number(id))

        if(!bookmark) {
            logger.error(`Bookmark with id:${id} not found.`)
            return res.status(404).send('Bookmark not found.')
        }
        return res.json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(book => book.id === Number(id))
        if(bookmarkIndex === -1) {
            logger.error(`Bookmark with id:"${id}" not found.`)
            res.status(404).send('Bookmark not found.')
        }
        bookmarks.splice(bookmarkIndex, 1)
        logger.info(`Bookmark with id:"${id}" was deleted.`)
        res.status(204).send(`Bookmark with id:"${id}" was deleted.`)
    })


module.exports = bookmarksRouter;

