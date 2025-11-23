import { app } from "./app";
import { connectDB } from "./data-source";

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error("Error during DB initialization:", err);
});
