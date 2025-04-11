const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const boletoController = require("../controllers/boletoController");

const upload = multer({ dest: path.join(__dirname, "../../uploads/csv") });


router.post("/importar-csv", upload.single("arquivo"), boletoController.importarCSV);
router.get('/', boletoController.listarBoletos); 

module.exports = router;
