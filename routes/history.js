const express = require("express");
const router = express.Router();
const connection = require("../config/database");

const { authenticateToken } = require("./auth");

// Get all history data
router.get("/", authenticateToken, (req, res) => {
  const query = "SELECT * FROM history";
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve history data" });
    } else {
      return res.status(200).json({
        status: true,
        message: "List of History Data",
        data: results,
      });
    }
  });
});

// Get history data by ID
router.get("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM history WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve history data" });
    } else {
      if (results.length === 0) {
        res.status(404).json({ message: "History not found" });
      } else {
        return res.status(200).json({
          status: true,
          message: "History Data Details",
          data: results[0],
        });
      }
    }
  });
});

// Add new history data
router.post("/", authenticateToken, (req, res) => {
  const { UserId, InventoryId, idPeminjaman, kondisi } = req.body;
  const query =
    "INSERT INTO history (UserId, InventoryId, idPeminjaman, kondisi) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [UserId, InventoryId, idPeminjaman, kondisi],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add history data" });
      } else {
        res.status(201).json({
          message: "History data added successfully",
          id: results.insertId,
        });
      }
    }
  );
});

// Update history data by ID
router.put("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const { UserId, InventoryId, idPeminjaman, kondisi } = req.body;
  // Check if history data with the provided ID exists
  const checkQuery = "SELECT * FROM history WHERE id = ?";
  connection.query(checkQuery, [id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(404).send("Failed to check history data");
    }
    const query =
      "UPDATE history SET UserId=?, InventoryId=?, idPeminjaman=?, kondisi=? WHERE id=?";
    connection.query(
      query,
      [UserId, InventoryId, idPeminjaman, kondisi, id],
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: "Failed to update history data" });
        } else {
          res
            .status(200)
            .json({ message: "History data updated successfully" });
        }
      }
    );
  });
});

// Delete history data by ID
router.delete("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM history WHERE id=?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete history data" });
    } else {
      if (results.affectedRows === 0) {
        res.status(404).json({ message: "History not found" });
      } else {
        res.status(200).json({ message: "History data deleted successfully" });
      }
    }
  });
});

module.exports = router;
