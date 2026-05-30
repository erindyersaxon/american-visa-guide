import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get("/", (_, res) => {
  res.json({
    message: "MCP server is running",
    status: "ok"
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "healthy"
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
