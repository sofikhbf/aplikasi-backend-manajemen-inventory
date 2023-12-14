const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Import Express Validator
const { body, validationResult } = require("express-validator");

const { authenticateToken, authenticateAdmin } = require("./auth");

// Import the database configuration
const connection = require("../config/database");

/**
 * INDEX USERS
 */
router.get("/", authenticateAdmin, function (req, res) {
  // Query
  connection.query(
    `SELECT a.id,
		a.username,
		a.roleId,
		b.name as roleName,
		c.firstName,
		c.lastName,
		c.email,
		c.phone,
		c.address,
		c.birthDate FROM users a join role b on a.roleId = b.id JOIN profile c on a.id = c.userId ORDER BY a.id desc`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Internal Server Error",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "List of User Data",
          data: rows,
        });
      }
    }
  );
});

/**
 * STORE USER
 */
router.post(
  "/",
  authenticateAdmin,
  [
    body("username").notEmpty(),
    body("password").notEmpty(),
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("email").notEmpty().isEmail(),
    body("phone").notEmpty().isMobilePhone(),
    body("address").notEmpty(),
    body("birthDate").notEmpty().isDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to start transaction" });
        return;
      }
      const query = "SELECT * FROM users WHERE username = ?";
      connection.query(query, [req.body.username], async (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Failed to register");
        } else if (results.length > 0) {
          res.status(409).json({ message: "Username already exists!" });
        } else {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          // Define formData
          let formData = {
            username: req.body.username,
            password: hashedPassword,
            roleId: 2, // Change with the role ID other than admin
          };

          // Insert query
          connection.query(
            "INSERT INTO users SET ?",
            formData,
            function (err, userResults) {
              if (err) {
                return res.status(500).json({
                  status: false,
                  message: "Internal Server Error",
                });
              }

              const { firstName, lastName, email, phone, address, birthDate } =
                req.body;

              const userId = userResults.insertId;
              // Second operation: Insert into the profile table
              const profileQuery =
                "INSERT INTO profile (firstName, lastName, email, phone, address, birthDate, userId) VALUES (?, ?, ?, ?, ?, ?, ?)";
              connection.query(
                profileQuery,
                [firstName, lastName, email, phone, address, birthDate, userId],
                (err, profileResults) => {
                  if (err) {
                    console.error(err);
                    connection.rollback(() => {
                      res
                        .status(500)
                        .json({ message: "Failed to add profile data" });
                    });
                    return;
                  }

                  // Commit the transaction if both operations succeed
                  connection.commit((err) => {
                    if (err) {
                      console.error(err);
                      connection.rollback(() => {
                        res.status(500).json({
                          message: "Failed to commit the transaction",
                        });
                      });
                    } else {
                      res.status(201).json({
                        message: "User data and profile successfully added",
                        userId,
                      });
                    }
                  });
                }
              );
            }
          );
        }
      });
    });
  }
);

/**
 * SHOW USER
 */
router.get("/(:id)", authenticateToken, function (req, res) {
  let id = req.params.id;

  connection.query(
    `SELECT a.id,
		a.username,
		a.roleId,
		b.name as roleName,
		c.firstName,
		c.lastName,
		c.email,
		c.phone,
		c.address,
		c.birthDate FROM users a join role b on a.roleId = b.id JOIN profile c on a.id = c.userId WHERE a.id = ${id}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Internal Server Error",
        });
      }

      // If the user is not found
      if (rows.length <= 0) {
        return res.status(404).json({
          status: false,
          message: "User data not found!",
        });
      }
      // If the user is found
      else {
        return res.status(200).json({
          status: true,
          message: "User Data Details",
          data: rows[0],
        });
      }
    }
  );
});

/**
 * UPDATE USER
 */
router.put(
  "/:id",
  authenticateToken,
  [
    body("username").notEmpty(),
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("email").notEmpty().isEmail(),
    body("phone").notEmpty().isMobilePhone(),
    body("address").notEmpty(),
    body("birthDate").notEmpty().isDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    // User ID
    let id = req.params.id;
    const hashedPassword = req.body.password
      ? await bcrypt.hash(req.body.password, 10)
      : undefined;

    // User data
    let formData = {
      username: req.body.username,
      password: hashedPassword,
      roleId: req.body.roleId || undefined,
    };
    if (!req.body.password) delete formData.password;
    if (!req.body.roleId) delete formData.roleId;
    connection.beginTransaction((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to start transaction" });
        return;
      }
      // Update query
      connection.query(
        `UPDATE users SET ? WHERE id = ${id}`,
        formData,
        function (err, rows) {
          if (err) {
            return res.status(500).json({
              status: false,
              message: "Internal Server Error",
            });
          }

          const { firstName, lastName, email, phone, address, birthDate } =
            req.body;
          // Second operation: Update the profile table
          const updateProfileQuery = `UPDATE profile SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ?, birthDate = ? WHERE userId = ${id}`;
          connection.query(
            updateProfileQuery,
            [firstName, lastName, email, phone, address, birthDate],
            (err, profileResults) => {
              if (err) {
                console.error(err);
                connection.rollback(() => {
                  res
                    .status(500)
                    .json({ message: "Failed to update profile data" });
                });
                return;
              }

              // Commit the transaction if both operations succeed
              connection.commit((err) => {
                if (err) {
                  console.error(err);
                  connection.rollback(() => {
                    res
                      .status(500)
                      .json({ message: "Failed to commit the transaction" });
                  });
                } else {
                  res.status(200).json({
                    message: "User data and profile successfully updated",
                  });
                }
              });
            }
          );
        }
      );
    });
  }
);

/**
 * DELETE USER
 */
router.delete(
  "/(:id)",
  authenticateAdmin,
  function authenticateAdmin(req, res) {
    let id = req.params.id;

    connection.query(
      `DELETE FROM users WHERE id = ${id}`,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Internal Server Error",
          });
        } else {
          return res.status(200).json({
            status: true,
            message: "Delete Data Successfully!",
          });
        }
      }
    );
  }
);

module.exports = router;
