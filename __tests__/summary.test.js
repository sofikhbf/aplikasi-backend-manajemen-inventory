// __tests__/summary.test.js
const request = require("supertest");
const express = require("express");
const app = express();
const summaryRouter = require("../routes/summary");

app.use("/summary", summaryRouter);

describe("GET /summary/admin", () => {
  it("should respond with summary data for admin", async () => {
    const response = await request(app).get("/summary/admin");
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});

describe("GET /summary/user", () => {
  it("should respond with summary data for user", async () => {
    const response = await request(app).get("/summary/user");
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});
