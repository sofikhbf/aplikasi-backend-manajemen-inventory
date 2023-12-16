// __tests__/auth.test.js
const request = require("supertest");
const express = require("express");
const app = express();
const authRouter = require("../routes/auth");

app.use("/auth", authRouter.router);

describe("POST /auth/login", () => {
  it("should respond with a token on successful login", async () => {
    const response = await request(app).post("/auth/login").send({
      username: "bayumaulanaikhsan",
      password: "123456", // Replace with a valid password
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should respond with an error on incorrect login credentials", async () => {
    const response = await request(app).post("/auth/login").send({
      username: "bayumaulanaikhsan",
      password: "12345", // Replace with an incorrect password
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Incorrect password");
  });
});

describe("POST /auth/logout", () => {
  it("should respond with a success message on logout", async () => {
    const response = await request(app).post("/auth/logout");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Logout successful");
  });
});

// Additional tests can be added for other authentication scenarios and error cases
