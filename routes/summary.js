const express = require("express");
const router = express.Router();
const connection = require("../config/database");
const { authenticateToken, authenticateAdmin } = require("./auth");

// Get all history data
router.get("/admin", authenticateAdmin, async (req, res) => {
  const userCountQuery = "SELECT COUNT(*) AS userCount FROM users";
  const historyCountQuery = "SELECT COUNT(*) AS historyCount FROM history";
  // Count loans with different statuses
  const countPendingPeminjamanQuery =
    "SELECT COUNT(*) AS pendingPeminjamanCount FROM peminjaman WHERE status = 'Pending'";
  const countAccPeminjamanQuery =
    "SELECT COUNT(*) AS accPeminjamanCount FROM peminjaman WHERE status = 'Accepted'";
  const countRejectedPeminjamanQuery =
    "SELECT COUNT(*) AS rejectedPeminjamanCount FROM peminjaman WHERE status = 'Rejected'";

  // Count inventory items
  const countInventoryQuery =
    "SELECT COUNT(*) AS inventoryCount FROM inventory";

  try {
    const userCountResult = await query(userCountQuery);
    const historyCountResult = await query(historyCountQuery);
    const pendingPeminjamanCount = await query(countPendingPeminjamanQuery);
    const accPeminjamanCount = await query(countAccPeminjamanQuery);
    const rejectedPeminjamanCount = await query(countRejectedPeminjamanQuery);
    const inventoryCount = await query(countInventoryQuery);

    const result = {
      userCount: userCountResult[0].userCount,
      historyCount: historyCountResult[0].historyCount,
      pendingPeminjamanCount: pendingPeminjamanCount[0].pendingPeminjamanCount,
      accPeminjamanCount: accPeminjamanCount[0].accPeminjamanCount,
      rejectedPeminjamanCount:
        rejectedPeminjamanCount[0].rejectedPeminjamanCount,
      inventoryCount: inventoryCount[0].inventoryCount,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get all history data
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  // Count loans for the specific user with different statuses
  const countPendingPeminjamanQuery = `SELECT COUNT(*) AS pendingPeminjamanCount FROM peminjaman WHERE userId = ${userId} AND status = 'Pending'`;
  const countAccPeminjamanQuery = `SELECT COUNT(*) AS accPeminjamanCount FROM peminjaman WHERE userId = ${userId} AND status = 'Accepted'`;
  const countRejectedPeminjamanQuery = `SELECT COUNT(*) AS rejectedPeminjamanCount FROM peminjaman WHERE userId = ${userId} AND status = 'Rejected'`;
  const historyCountQuery = `SELECT COUNT(*) AS historyCount FROM history WHERE userId = ${userId}`;

  try {
    const historyCountResult = await query(historyCountQuery);
    const pendingPeminjamanCount = await query(countPendingPeminjamanQuery);
    const accPeminjamanCount = await query(countAccPeminjamanQuery);
    const rejectedPeminjamanCount = await query(countRejectedPeminjamanQuery);

    const result = {
      historyCount: historyCountResult[0].historyCount,
      pendingPeminjamanCount: pendingPeminjamanCount[0].pendingPeminjamanCount,
      accPeminjamanCount: accPeminjamanCount[0].accPeminjamanCount,
      rejectedPeminjamanCount:
        rejectedPeminjamanCount[0].rejectedPeminjamanCount,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function query(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = router;
