import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3007;
const app = createApp();

app.listen(PORT, () => {
  const base = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) {
    console.log(`Server ready — ${base}`);
  } else {
    console.log(`Listening on port ${PORT}`);
  }
});
