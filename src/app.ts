import express, { Express, Request, Response } from "express";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/", express.static(__dirname + "/"));
app.use("/style", express.static(__dirname + "/style"));
app.use("/app", express.static(__dirname + "/app"));

app.listen(port, () => {
  console.log(`running at http://localhost:${port}`);
});
