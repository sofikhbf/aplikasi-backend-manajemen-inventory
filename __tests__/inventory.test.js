const request = require("supertest");
const express = require("express");
const app = express();
const inventoryRouter = require("../routes/inventory");
const path = require("path");

app.use(express.json());
app.use("/inventory", inventoryRouter);

// describe("POST /inventory", () => {
//   it("should add a new inventory data with image for admin", async () => {
//     const newInventoryData = {
//       nama: "Test Inventory",
//       deskripsi: "Test Description",
//       alamat: "Test Address",
//       kategori: "Test Category",
//       status: "Active",
//     };
//     const imagePath = path.resolve(
//       __dirname,
//       "../uploads/1702605248633-inventory-gojo.jpg" // change image for your test
//     );
//     const response = await request(app)
//       .post("/inventory")
//       .attach("image", imagePath)
//       .field(newInventoryData);

//     expect(response.status).toBe(201);
//     // Add more assertions based on your expected response structure
//   });
// });

describe("GET /inventory", () => {
  it("should respond with list of inventory data for user", async () => {
    const response = await request(app).get("/inventory");
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});

describe("GET /inventory/:id", () => {
  it("should respond with inventory data details for user", async () => {
    const inventoryId = 18; // Set the inventory ID based on your test data
    const response = await request(app).get(`/inventory/${inventoryId}`);
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});

describe("PUT /inventory/:id", () => {
  it("should update inventory data with image for admin", async () => {
    const inventoryId = 18; // Set the inventory ID based on your test data
    const updatedInventoryData = {
      nama: "Updated Test Inventory",
      deskripsi: "Updated Test Description",
      alamat: "Updated Test Address",
      kategori: "Updated Test Category",
      status: "Inactive",
    };

    const response = await request(app)
      .put(`/inventory/${inventoryId}`)
      .field(updatedInventoryData);

    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});

describe("DELETE /inventory/:id", () => {
  it("should delete inventory data for admin", async () => {
    const inventoryId = 19; // Set the inventory ID based on your test data
    const response = await request(app).delete(`/inventory/${inventoryId}`);
    expect(response.status).toBe(200);
    // Add more assertions based on your expected response structure
  });
});
