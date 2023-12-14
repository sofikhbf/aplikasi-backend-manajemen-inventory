require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const connection = require("../config/database");

router.use(express.json());

// Function to generate a token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username, roleId: user.roleId },
    process.env.SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
};

const authenticateToken = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader) {
    return res.status(401).json({ message: "Token not available" });
  }

  const token = tokenHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token not valid", error: err.message });
    }
    req.user = decoded;
    next();
  });
};

// Middleware to check token and admin role
const authenticateAdmin = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader) {
    return res.status(401).json({ message: "Token not available" });
  }
  const token = tokenHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token not valid", error: err.message });
    }
    // Check if the user has an admin role
    if (decoded && decoded.roleId === 1) {
      req.user = decoded;
      next();
    } else {
      return res.status(403).json({
        message: "Access denied. User is not an admin!",
      });
    }
  });
};

// Endpoint for login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to log in");
    } else if (results.length === 0) {
      res.status(401).json({ message: "Username not found" });
    } else {
      const user = results[0];
      // Compare the entered password with the password in the database
      bcrypt.compare(password, user.password, (bcryptErr, match) => {
        if (bcryptErr) {
          console.error(bcryptErr);
          res.status(500).send("Failed to log in");
        } else if (match) {
          const token = generateToken(user);
          res.status(200).json({ message: "Login successful", token });
        } else res.status(401).json({ message: "Incorrect password" });
      });
    }
  });
});

// Endpoint for logout
router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json({ message: "Logout successful" });
});

module.exports = { router, authenticateToken, authenticateAdmin };
