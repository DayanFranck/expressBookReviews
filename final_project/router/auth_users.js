const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const secretKey = "secret_key"; 

const isValid = (username) => {
  // Write code to check if the username is valid
  return true; // For demonstration purposes, always returning true
}

const authenticatedUser = (username, password) => {
  // Write code to check if username and password match the one we have in records
  return true; // For demonstration purposes, always returning true
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  // Get the user details from the request body
  let { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password must be provided" });
  }

  // Check if the username is valid
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  // Check if the user is authenticated
  if (authenticatedUser(username, password)) {
    // Create a JWT token
    let token = jwt.sign({ username: username }, secretKey, { expiresIn: "1h" });

    // Return the token
    return res.status(200).json({ message: "User logged in successfully", token: token });
  } else {
    // If the user is not authenticated, return an error message
    return res.status(401).json({ message: "Invalid username or password" });
  }
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
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
        // Check if the user has a review for this book
        if (book.reviews && book.reviews[username]) {
          // Delete the review
          delete book.reviews[username];

          // Return a success message
          return res.status(200).json({ message: "Review deleted successfully" });
        } else {
          // If the user does not have a review for this book, return a message
          return res.status(404).json({ message: "No review found for this user" });
        }
      } else {
        // If the book does not exist, return a message
        return res.status(404).json({ message: "Book not found" });
      }
    }
  });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
