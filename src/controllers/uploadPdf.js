const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const getConnection = require('../database/connection');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const outputDir = path.join(__dirname, '../../uploads/pdf');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const fullPdf = await PDFDocument.load(pdfBuffer);
    const totalPages = fullPdf.getPageCount();

    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT id FROM boletos ORDER BY criado_em`
    );
    const boletos = result.rows;

    if (boletos.length !== totalPages) {
      return res.status(400).json({
        error: 'Número de páginas do PDF não corresponde à quantidade de boletos no banco de dados.',
      });
    }

    for (let i = 0; i < totalPages; i++) {
      const boleto = boletos[i];
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(fullPdf, [i]);
      newPdf.addPage(copiedPage);

      const pdfBytes = await newPdf.save();
      const filename = `${boleto.ID}.pdf`;
      const filePath = path.join(outputDir, filename);

      fs.writeFileSync(filePath, pdfBytes);
    }

    res.json({ message: 'PDFs gerados com sucesso!', count: totalPages });
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    res.status(500).json({ error: 'Erro ao processar PDF' });
  }
});

module.exports = router;
