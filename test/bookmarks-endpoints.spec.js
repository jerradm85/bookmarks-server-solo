const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookmarksArray } = require("./bookmarks.fixtures");

describe.only("Bookmarks Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });
  // destroy our database connection when done so our tests don't hang
  after("disconnect from db", () => db.destroy());

  // remove all data from the table before running any tests
  before("clean the table", () => db("bookmarks").truncate());

  // remove all data from the table after each test to prepare for the next
  afterEach("cleanup", () => db("bookmarks").truncate());

  describe(`GET /bookmarks`, () => {
    context("Given no bookmarks data", () => {
      it("responds with 200 and an empty array", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(200, []);
      });
    });

    context("Given bookmarks has data", () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach("insert bookmarks into database", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });
      it("responds with 200 and all bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(200, testBookmarks);
      });
    });
  });

  describe(`GET /bookmarks/:id`, () => {
    context("Given no bookmarks data", () => {
      it("responds with 404 not found", () => {
        const bookmarkId = 1000;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
      });
    });

    context(`Given bookmarks has data`, () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach("insert bookmarks into database", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds 200 with specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", "Bearer " + process.env.API_TOKEN)
          .expect(200, expectedBookmark);
      });
    });
  });
});
