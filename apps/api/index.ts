import { prisma } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(authMiddleware);

app.post("/projects", async (req, res) => {
  const {  prompt } = req.body;
  const userId = req.userId;
  // logic to get name
  const description = prompt.split(" ").slice(0, 3).join(" ");

  const project = await prisma.project.create({
    data: { description, userId },
  });
  res.json({projectId: project.id});
});

app.get("/projects", async (req, res) => {
  const userId = req.userId;
  const projects = await prisma.project.findFirst({
    where: { userId },
  });
  res.json(projects);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});