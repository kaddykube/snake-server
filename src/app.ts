import express, { Express, Request, Response } from "express";

const path = require("path");
const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/", express.static(__dirname + "/"));
app.use("/app", express.static(__dirname + "/app"));

app.listen(port, () => {
  console.log(`running at http://localhost:${port}`);
});
