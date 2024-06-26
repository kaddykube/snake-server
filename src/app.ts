import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Server");
});

app.listen(port, () => {
  console.log(`running at http://localhost:${port}`);
});
