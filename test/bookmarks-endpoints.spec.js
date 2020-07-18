const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')
const supertest = require('supertest')

describe.only('bookmarks-endpoint', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })
    after('disconnect from database', () => db.destroy())
    before('clean the table', () => db('bookmarks').truncate())
    afterEach('cleanup after each test', () => db('bookmarks').truncate())

    describe(`get /bookmarks/:id`, () => {
        // context('given no bookmarks data', () => {
        //     it('responds with 404 not found', ()  => {
        //         const bookmarkId = '1000';
        //         return supertest(app)
        //             .get(`/bookmarks/${bookmarkId}`)
        //             .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
        //             .expect(404, {})
        //     })
        // })

        context('given bookmarks has data', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach('insert bookmarks into database', () => {
                return db.into('bookmarks').insert(testBookmarks)
            })
            it('responds 200 with specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                    .expect(200, expectedBookmark)
            }) 
        })
    })

    describe(`get /bookmarks`, () => {
        context('given no bookmarks data', () => {
            it('responds with 200 and an empty array', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                    .expect(200, [])
            })
        })
        context('given bookmarks has data', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach('insert bookmarks into database', () => {
                return db.into('bookmarks').insert(testBookmarks)
            })
            it('responds with 200 and all bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                    .expect(200, testBookmarks)
            })
        })
    })
})