const express = require("express");
const app = express();
const boletoRoutes = require("./routes/boleto.routes");
const uploadPdfRoutes = require('./routes/uploadPdf.routes');

app.use(express.json());
app.use("/boletos", boletoRoutes);
app.use('/pdf', uploadPdfRoutes);

module.exports = app;
