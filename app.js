const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");

// init app & middleware
const app = express();
app.use(express.json());

// db connection
let db;
connectToDb((err) => {
  if (err) {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  }
  app.listen(3000, () => {
    console.log("App is listening on port 3000");
  });
  db = getDb();
});

// routes
app.get("/books", (req, res) => {
  const page = parseInt(req.query.p) >= 0 ? parseInt(req.query.p) : 0;
  const booksPerPage = 3;
  let books = [];

  db.collection("books")
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => res.status(200).json(books))
    .catch(() =>
      res.status(500).json({ error: "Could not fetch books from the database" })
    );
});

app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((doc) => {
        if (doc) {
          res.status(200).json(doc);
        } else {
          res.status(404).json({ error: "Book not found" });
        }
      })
      .catch(() => res.status(500).json({ error: "Could not fetch the book" }));
  } else {
    res.status(400).json({ error: "Not a valid document ID" });
  }
});

app.post("/books", (req, res) => {
  const book = req.body;
  if (!book.title || !book.author) {
    return res.status(400).json({ error: "Title and author are required" });
  }
  db.collection("books")
    .insertOne(book)
    .then((result) => res.status(201).json(result))
    .catch(() =>
      res.status(500).json({ error: "Could not create a new book" })
    );
});

app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        if (result.deletedCount === 0) {
          res.status(404).json({ error: "Book not found" });
        } else {
          res.status(200).json(result);
        }
      })
      .catch(() =>
        res.status(500).json({ error: "Could not delete the book" })
      );
  } else {
    res.status(400).json({ error: "Not a valid document ID" });
  }
});

app.patch("/books/:id", (req, res) => {
  const updates = req.body;
  if (ObjectId.isValid(req.params.id)) {
    if (!updates.title && !updates.author) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }
    db.collection("books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        if (result.matchedCount === 0) {
          res.status(404).json({ error: "Book not found" });
        } else {
          res.status(200).json(result);
        }
      })
      .catch(() =>
        res.status(500).json({ error: "Could not update the book" })
      );
  } else {
    res.status(400).json({ error: "Not a valid document ID" });
  }
});


