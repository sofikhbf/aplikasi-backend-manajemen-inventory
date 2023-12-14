const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const connection = require("../config/database");
const { body, validationResult } = require("express-validator");
const { authenticateToken, authenticateAdmin } = require("./auth");

router.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const originalnameWithoutSpaces = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-inventory-${originalnameWithoutSpaces}`);
  },
});

const upload = multer({ storage });

// Endpoint for uploading inventory images
router.post("/", authenticateAdmin, upload.single("image"), (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { nama, deskripsi, alamat, kategori, status } = req.body;
  const { filename } = req.file;
  const gambar = req.file.filename;

  const imageUrl = filename ? filename : null;
  const url = filename
    ? `${req.protocol}://${req.get("host")}/inventory/image/${gambar}`
    : null;
  const query =
    "INSERT INTO inventory (nama, deskripsi, alamat, kategori, image, status) VALUES (?, ?, ?, ?, ?, ?)";
  connection.query(
    query,
    [nama, deskripsi, alamat, kategori, imageUrl, status],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Failed to add inventory data");
      } else {
        res.status(201).json({ message: "Inventory data successfully added" });
      }
    }
  );
});

// Endpoint to get all inventory data
router.get("/", authenticateToken, (req, res) => {
  const query = "SELECT * FROM inventory";
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to retrieve inventory data");
    } else {
      return res.status(200).json({
        status: true,
        message: "List of Inventory Data",
        data: results,
      });
    }
  });
});

// Endpoint to get inventory data by ID
router.get("/:id", authenticateToken, (req, res) => {
  const inventoryId = req.params.id;
  const query = "SELECT * FROM inventory WHERE id = ?";
  connection.query(query, [inventoryId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to retrieve inventory data");
    } else if (results.length === 0) {
      res.status(404).json({ message: "Inventory data not found" });
    } else {
      return res.status(200).json({
        status: true,
        message: "Inventory Data Details",
        data: results[0],
      });
    }
  });
});

// Endpoint to update inventory data by ID
router.put("/:id", authenticateAdmin, upload.single("image"), (req, res) => {
  const inventoryId = req.params.id;
  // Check if ID is provided
  if (!inventoryId) {
    return res
      .status(400)
      .json({ message: "ID is required for updating inventory data" });
  }

  const { nama, deskripsi, alamat, kategori, status } = req.body;

  // If there is a new image upload
  let imageUrl;
  let filename = undefined;
  if (req.file) {
    const { filename } = req.file;
    imageUrl = path.join(__dirname, "uploads", filename);
  }
  // Check if inventory data with the provided ID exists
  const checkQuery = "SELECT * FROM inventory WHERE id = ?";
  connection.query(checkQuery, [inventoryId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send("Failed to check inventory data");
    }

    if (checkResults.length === 0)
      return res.status(404).json({ message: "Inventory data not found" });
    // If there is a new image upload, delete the old image file
    if (imageUrl && checkResults[0].image) {
      const parentDirectory = path.join(__dirname, "..");
      const oldImagePath = path.join(
        parentDirectory,
        "uploads",
        checkResults[0].image
      );

      // Delete the old image file
      fs.unlink(oldImagePath, (unlinkErr) => {
        // if (unlinkErr) {
        //   console.error(unlinkErr);
        //   return res.status(500).send("Failed to delete old image file");
        // }

        // Proceed to update the database with the new image
        updateInventoryData();
      });
    } else {
      // No new image upload, proceed to update the database
      updateInventoryData();
    }
  });
  function updateInventoryData() {
    // If there is no new image upload or the image file is not present
    if (!filename || !imageUrl) {
      const updateQuery =
        "UPDATE inventory SET nama = ?, deskripsi = ?, alamat = ?, kategori = ?, status = ? WHERE id = ?";
      connection.query(
        updateQuery,
        [nama, deskripsi, alamat, kategori, status, inventoryId],
        (err, rows) => {
          if (err) {
            console.error(err);
            res.status(500).send("Failed to update inventory data");
          } else if (rows.length <= 0) {
            // If the inventory is not found
            if (rows.length <= 0) {
              return res.status(404).json({
                status: false,
                message: "Inventory data not found!",
              });
            }
          } else {
            res
              .status(200)
              .json({ message: "Inventory data successfully updated" });
          }
        }
      );
    } else {
      // If there is a new image upload
      const updateQueryWithImage =
        "UPDATE inventory SET nama = ?, deskripsi = ?, alamat = ?, kategori = ?, image = ?, status = ? WHERE id = ?";
      connection.query(
        updateQueryWithImage,
        [nama, deskripsi, alamat, kategori, imageUrl, status, inventoryId],
        (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Failed to update inventory data");
          } else {
            res
              .status(200)
              .json({ message: "Inventory data successfully updated" });
          }
        }
      );
    }
  }
});

// Endpoint to delete inventory data by ID
router.delete("/:id", authenticateAdmin, (req, res) => {
  const inventoryId = req.params.id;
  // Check if inventory data with the provided ID exists
  const checkQuery = "SELECT * FROM inventory WHERE id = ?";
  connection.query(checkQuery, [inventoryId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send("Failed to check inventory data");
    }

    if (checkResults.length === 0)
      return res.status(404).json({ message: "Inventory data not found" });

    const deleteQuery = "DELETE FROM inventory WHERE id = ?";
    connection.query(deleteQuery, [inventoryId], (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Failed to delete inventory data");
      } else {
        res
          .status(200)
          .json({ message: "Inventory data successfully deleted" });
      }
    });
  });
});

module.exports = router;
