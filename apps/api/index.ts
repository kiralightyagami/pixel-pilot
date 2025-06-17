import { prisma } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authMiddleware);

app.post("/project", async (req, res) => {
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
  const projects = await prisma.project.findMany({
    where: { userId },
  });
  res.json(projects);
});

app.get("/projects/:id", async (req, res) => {

  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
  });
  res.json(project);
});

app.listen(5858, () => {
  console.log("Server is running on port 5858");
});