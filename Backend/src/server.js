import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend API is running at http://localhost:${PORT}`);
});
