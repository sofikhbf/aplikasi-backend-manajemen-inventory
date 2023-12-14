const request = require("supertest");
const express = require("express");
const app = express();
const usersRouter = require("../routes/users");

app.use(express.json());

app.use("/users", usersRouter);

describe("GET /users", () => {
  it("should respond with list of user data for admin", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});

describe("POST /users", () => {
  it("should add a new user and profile data for admin", async () => {
    const newUser = {
      username: "newuser123",
      password: "newpassword",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "1234567890",
      address: "123 Main St",
      birthDate: "1990-01-01",
    };

    const response = await request(app).post("/users").send(newUser);
    expect(response.status).toBe(201);
    // Add more assertions based on your expected response structure
  });
});

describe("GET /users/:id", () => {
  it("should respond with user data details for admin", async () => {
    const userId = 24; // Set the user ID based on your test data
    const response = await request(app).get(`/users/${userId}`);
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});

describe("PUT /users/:id", () => {
  it("should update user and profile data for admin", async () => {
    const userId = 1; // Set the user ID based on your test data
    const updatedUserData = {
      username: "updateduser",
      firstName: "Updated",
      lastName: "User",
      email: "updated.user@example.com",
      phone: "9876543210",
      address: "456 Updated St",
      birthDate: "1995-01-01",
    };

    const response = await request(app)
      .put(`/users/${userId}`)
      .send(updatedUserData);
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});

describe("DELETE /users/:id", () => {
  it("should delete user data for admin", async () => {
    const userId = 1; // Set the user ID based on your test data
    const response = await request(app).delete(`/users/${userId}`);
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});
