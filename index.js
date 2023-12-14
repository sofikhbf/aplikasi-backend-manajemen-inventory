const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
//import library CORS
const cors = require("cors");

//import body parser
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//use cors
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to api inventory!");
});

const usersRouter = require("./routes/users");
const inventoryRouter = require("./routes/inventory");
const loginRouter = require("./routes/auth");
const peminjamanRouter = require("./routes/peminjaman");
const historyRouter = require("./routes/history");
const summaryRouter = require("./routes/summary");

app.use("/api/users", usersRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api", loginRouter.router);
app.use("/api/peminjaman", peminjamanRouter);
app.use("/api/history", historyRouter);
app.use("/api/summary", summaryRouter);

// endpoint to display images
app.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, "uploads", filename));
});

app.listen(port, () => {
  console.log(`app running at http://localhost:${port}`);
});
