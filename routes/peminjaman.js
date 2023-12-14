const express = require("express");
const router = express.Router();

//import database
const connection = require("../config/database");

const { authenticateToken, authenticateAdmin } = require("./auth");

// Get all data peminjaman
router.get("/", authenticateAdmin, (req, res) => {
  const query = "SELECT * FROM peminjaman";
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get data peminjaman" });
    } else {
      return res.status(200).json({
        status: true,
        message: "List of Peminjaman Data",
        data: results,
      });
    }
  });
});

// Get all data peminjaman by user id
router.get("/get-data", authenticateToken, (req, res) => {
  const userId = req.user["userId"];
  const query = `SELECT * FROM peminjaman WHERE userId = ${userId}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get data peminjaman" });
    } else {
      return res.status(200).json({
        status: true,
        message: "List of Peminjaman Data",
        data: results,
      });
    }
  });
});

// Get data peminjaman by user id
router.get("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM peminjaman WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get data peminjaman" });
    } else {
      if (results.length === 0) {
        res.status(404).json({ message: "Peminjaman not found !" });
      } else {
        return res.status(200).json({
          status: true,
          message: "Peminjaman Data Details",
          data: results[0],
        });
      }
    }
  });
});

router.post("/", authenticateToken, (req, res) => {
  const {
    inventoryId,
    DateStart,
    DateEnd,
    description,
    status,
    inStock,
    outStock,
  } = req.body;
  const userId = req.user["userId"];
  const query =
    "INSERT INTO peminjaman (inventoryId, DateStart, DateEnd, description, status, inStock, outStock,userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  connection.query(
    query,
    [
      inventoryId,
      DateStart,
      DateEnd,
      description,
      status,
      inStock,
      outStock,
      userId,
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed add data peminjaman" });
      } else {
        res.status(201).json({
          message: "Peminjaman data successfully added",
          id: results.insertId,
        });
      }
    }
  );
});

router.put("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const { inventoryId, DateStart, DateEnd, description, inStock, outStock } =
    req.body;
  const query =
    "UPDATE peminjaman SET inventoryId=?, DateStart=?, DateEnd=?, description=?, inStock=?, outStock=? WHERE id=?";
  connection.query(
    query,
    [inventoryId, DateStart, DateEnd, description, inStock, outStock, id],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update peminjaman data" });
      } else {
        res
          .status(200)
          .json({ message: "Peminjaman data successfully updated" });
      }
    }
  );
});

// Delete data
router.delete("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM peminjaman WHERE id=?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed delete peminjaman data" });
    } else {
      if (results.affectedRows === 0) {
        res.status(404).json({ message: "Peminjaman not found !" });
      } else {
        res
          .status(200)
          .json({ message: "Peminjaman data successfully deleted" });
      }
    }
  });
});

// Updated data peminjaman by ID
router.put("/update-validasi/:id", authenticateAdmin, (req, res) => {
  const id = req.params.id;
  const {
    inventoryId,
    DateStart,
    DateEnd,
    description,
    status,
    inStock,
    outStock,
  } = req.body;
  const query =
    "UPDATE peminjaman SET inventoryId=?, DateStart=?, DateEnd=?, description=?, status=?, inStock=?, outStock=? WHERE id=?";
  connection.query(
    query,
    [
      inventoryId,
      DateStart,
      DateEnd,
      description,
      status,
      inStock,
      outStock,
      id,
    ],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed updated peminjaman data" });
      } else {
        res
          .status(200)
          .json({ message: "Peminjaman data successfully updated" });
      }
    }
  );
});

module.exports = router;
