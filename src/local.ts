import express, { Request, Response } from "express";
import { generateHTML } from "./common";

const app = express();

app.get("/h", async (req: Request, res: Response) => {
  const articleId = req.query.article as string;

  const html = await generateHTML(articleId);

  res.send(html);
});

app.listen(6969, () => console.log("Listening on port 6969"));
