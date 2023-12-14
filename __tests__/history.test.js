// __tests__/history.test.js
const request = require("supertest");
const express = require("express");
const app = express();
const historyRouter = require("../routes/history");

app.use(express.json());
app.use("/history", historyRouter);

describe("GET /history", () => {
  it("should respond with a list of history data", async () => {
    const response = await request(app).get("/history");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", true);
    expect(response.body).toHaveProperty("message", "List of History Data");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeInstanceOf(Array);
  });
});

describe("GET /history/:id", () => {
  it("should respond with details of a specific history data", async () => {
    // Replace ":id" with an actual ID from your database
    const id = 2;

    const response = await request(app).get(`/history/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", true);
    expect(response.body).toHaveProperty("message", "History Data Details");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeInstanceOf(Object);
  });

  it("should respond with a 404 status for an invalid ID", async () => {
    const invalidId = 9999;

    const response = await request(app).get(`/history/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "History not found");
  });
});

describe("POST /history", () => {
  it("should add a new history data", async () => {
    const newHistoryData = {
      UserId: 1, // Replace with valid user ID
      InventoryId: 1, // Replace with valid inventory ID
      idPeminjaman: 1, // Replace with valid peminjaman ID
      kondisi: "Good",
    };

    const response = await request(app).post("/history").send(newHistoryData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "History data added successfully"
    );
    expect(response.body).toHaveProperty("id");
  });
});

describe("PUT /history/:id", () => {
  it("should update a specific history data", async () => {
    // Replace ":id" with an actual ID from your database
    const id = 2;
    const updatedHistoryData = {
      UserId: 1, // Replace with updated user ID
      InventoryId: 1, // Replace with updated inventory ID
      idPeminjaman: 1, // Replace with updated peminjaman ID
      kondisi: "Excellent",
    };

    const response = await request(app)
      .put(`/history/${id}`)
      .send(updatedHistoryData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "History data updated successfully"
    );
  });

  //   it("should respond with a 404 status for updating with an invalid ID", async () => {
  //     const invalidId = 9999;
  //     const updatedHistoryData = {
  //       UserId: 1, // Replace with updated user ID
  //       InventoryId: 1, // Replace with updated inventory ID
  //       idPeminjaman: 1, // Replace with updated peminjaman ID
  //       kondisi: "Excellent",
  //     };

  //     const response = await request(app)
  //       .put(`/history/${invalidId}`)
  //       .send(updatedHistoryData);

  //     expect(response.status).toBe(404);
  //     expect(response.body).toHaveProperty("message", "History not found");
  //   });
});

describe("DELETE /history/:id", () => {
  it("should delete a specific history data", async () => {
    // Replace ":id" with an actual ID from your database
    const id = 5;

    const response = await request(app).delete(`/history/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "History data deleted successfully"
    );
  });

  it("should respond with a 404 status for deleting with an invalid ID", async () => {
    const invalidId = 9999;

    const response = await request(app).delete(`/history/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "History not found");
  });
});
