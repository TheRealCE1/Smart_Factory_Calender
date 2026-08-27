const express = require("express");
const eventsRoutes = require("./routes/events");

const app = express();

app.use(express.json());

app.use("/events", eventsRoutes);

app.get("/", (req, res) => {
  res.send("Calendario Empresarial");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});