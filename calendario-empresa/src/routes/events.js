const express = require("express");

const router = express.Router();

const eventos = [
  {
    id: 1,
    titulo: "Junta de Producción",
    fecha: "2026-08-28"
  }
];

router.get("/", (req, res) => {
  res.json(eventos);
});

module.exports = router;