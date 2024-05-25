const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const jwt = require("jsonwebtoken");
const secretKey = "1234567"; //
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  // Get the user details from the request body
  let userDetails = req.body;

  // Check if username and password are provided
  if (!userDetails.username || !userDetails.password) {
    return res
      .status(400)
      .json({ message: "Username and password must be provided" });
  }

  // Check if the user already exists in the 'users' database
  if (users[userDetails.username]) {
    // If the user exists, return a message
    return res.status(400).json({ message: "User already exists" });
  } else {
    // If the user does not exist, add them to the 'users' database
    users[userDetails.username] = userDetails;

    // Return a success message
    return res.status(200).json({ message: "User registered successfully" });
  }
});

// Get book reviews based on ISBN
public_users.get("/review/:isbn", function (req, res) {
  // Get the ISBN from the request parameters
  let isbn = req.params.isbn;

  // Find the book with the given ISBN
  let book = books[isbn];

  // Check if the book exists
  if (book) {
    // If the book exists, return the book reviews
    return res.status(200).json(book.reviews);
  } else {
    // If the book does not exist, return a message
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.post("/register", (req, res) => {
  // Get the user details from the request body
  let userDetails = req.body;

  // Check if username and password are provided
  if (!userDetails.username || !userDetails.password) {
    return res
      .status(400)
      .json({ message: "Username and password must be provided" });
  }

  // Check if the user already exists in the 'users' database
  if (users[userDetails.username]) {
    // If the user exists, return a message
    return res.status(400).json({ message: "User already exists" });
  } else {
    // If the user does not exist, add them to the 'users' database
    users[userDetails.username] = userDetails;

    // Return a success message
    return res.status(200).json({ message: "User registered successfully" });
  }
});

// User login
public_users.post("/customer/login", (req, res) => {
  // Get the user details from the request body
  let userDetails = req.body;

  // Check if username and password are provided
  if (!userDetails.username || !userDetails.password) {
    return res
      .status(400)
      .json({ message: "Username and password must be provided" });
  }

  // Check if the user exists in the 'users' database
  if (users[userDetails.username]) {
    // Check if the password matches
    if (users[userDetails.username].password === userDetails.password) {
      // Create a JWT token
      let token = jwt.sign({ username: userDetails.username }, secretKey, {
        expiresIn: "1h",
      });

      // Return the token
      return res
        .status(200)
        .json({ message: "User logged in successfully", token: token });
    } else {
      // If the password does not match, return a message
      return res.status(401).json({ message: "Invalid password" });
    }
  } else {
    // If the user does not exist, return a message
    return res.status(404).json({ message: "User not found" });
  }
});

// Add or update a book review
public_users.post("/review/:isbn", function (req, res) {
  // Get the ISBN from the request parameters
  let isbn = req.params.isbn;

  // Get the review from the request body
  let review = req.body.review;

  // Get the token from the request headers
  let token = req.headers["authorization"];

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // If the token is not valid, return a message
      return res.status(401).json({ message: "Invalid token" });
    } else {
      // Get the username from the decoded token
      let username = decoded.username;

      // Find the book with the given ISBN
      let book = books[isbn];

      // Check if the book exists
      if (book) {
        // If the book exists, add or update the review
        if (!book.reviews) {
          book.reviews = {};
        }
        book.reviews[username] = review;

        // Return a success message
        return res
          .status(200)
          .json({ message: "Review added/updated successfully" });
      } else {
        // If the book does not exist, return a message
        return res.status(404).json({ message: "Book not found" });
      }
    }
  });
});

// Delete a book review
public_users.delete("/auth/review/:isbn", function (req, res) {
  // Get the ISBN from the request parameters
  let isbn = req.params.isbn;

  // Get the token from the request headers
  let token = req.headers["authorization"];

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // If the token is not valid, return a message
      return res.status(401).json({ message: "Invalid token" });
    } else {
      // Get the username from the decoded token
      let username = decoded.username;

      // Find the book with the given ISBN
      let book = books[isbn];

      // Check if the book exists
      if (book) {
        // If the book exists, check if the user has a review
        if (book.reviews && book.reviews[username]) {
          // If the user has a review, delete it
          delete book.reviews[username];

          // Return a success message
          return res
            .status(200)
            .json({ message: "Review deleted successfully" });
        } else {
          // If the user does not have a review, return a message
          return res
            .status(404)
            .json({ message: "No review found for this user" });
        }
      } else {
        // If the book does not exist, return a message
        return res.status(404).json({ message: "Book not found" });
      }
    }
  });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  // Check if books are available
  if (books && Object.keys(books).length > 0) {
    // Format the list of books using JSON.stringify and then parse it back to JSON
    const formattedBooks = JSON.parse(JSON.stringify(books, null, 2));
    return res.status(200).json(formattedBooks);
  } else {
    // If no books are available, return a message
    return res.status(200).json({ message: "No books available in the shop" });
  }
});

// Fetch book details using async-await with Axios
const fetchBookDetails = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/books/${isbn}`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching book details: " + error.message);
  }
};

// Get book details based on ISBN using async-await with Axios
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    // Get the ISBN from the request parameters
    let isbn = req.params.isbn;

    // Fetch book details using Axios
    const book = await fetchBookDetails(isbn);

    // Check if the book exists
    if (book) {
      // If the book exists, return the book details
      return res.status(200).json(book);
    } else {
      // If the book does not exist, return a message
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    // Handle any errors
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch books by author using async-await with Axios
const fetchBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/books?author=${author}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books by author: " + error.message);
  }
};

// Get book details based on author using async-await with Axios
public_users.get("/author/:author", async (req, res) => {
  try {
    // Get the author from the request parameters
    let author = req.params.author;

    // Fetch books by author using Axios
    const booksByAuthor = await fetchBooksByAuthor(author);

    // Check if any books by the author exist
    if (booksByAuthor.length > 0) {
      // If books by the author exist, return the book details
      return res.status(200).json(booksByAuthor);
    } else {
      // If no books by the author exist, return a message
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    // Handle any errors
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch books by title using async-await with Axios
const fetchBooksByTitle = async (title) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/books?title=${title}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books by title: " + error.message);
  }
};

// Get book details based on title using async-await with Axios
public_users.get("/title/:title", async (req, res) => {
  try {
    // Get the title from the request parameters
    let title = req.params.title;

    // Fetch books by title using Axios
    const booksByTitle = await fetchBooksByTitle(title);

    // Check if any books with the title exist
    if (booksByTitle.length > 0) {
      // If books with the title exist, return the book details
      return res.status(200).json(booksByTitle);
    } else {
      // If no books with the title exist, return a message
      return res
        .status(404)
        .json({ message: "No books found with this title" });
    }
  } catch (error) {
    // Handle any errors
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Function to fetch book list using Axios with async-await
const fetchBookList = async () => {
  try {
    const response = await axios.get("http://localhost:5000/books");
    return response.data;
  } catch (error) {
    throw new Error("Error fetching book list: " + error.message);
  }
};

// Route to get the book list available in the shop using async-await with Axios
public_users.get("/", async (req, res) => {
  try {
    const books = await fetchBookList();
    if (books && Object.keys(books).length > 0) {
      return res.status(200).json(books);
    } else {
      return res
        .status(200)
        .json({ message: "No books available in the shop" });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports.general = public_users;
