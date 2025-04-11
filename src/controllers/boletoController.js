const parseCSV = require("../utils/csvParser");
const getConnection = require("../database/connection");
const PDFDocument = require("pdfkit");
const stream = require("stream");

exports.importarCSV = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("Arquivo CSV não enviado.");

  try {
    const registros = await parseCSV(file.path);
    const conn = await getConnection();

    for (let reg of registros) {
      const unidade = reg.unidade.toString().padStart(4, "0");

      const resultLote = await conn.execute(
        "SELECT id FROM lotes WHERE nome = :nome AND ativo = 1",
        [unidade]
      );

      if (resultLote.rows.length === 0) {
        console.log(`Lote ${unidade} não encontrado.`);
        continue;
      }

      const id_lote = resultLote.rows[0].ID;

      await conn.execute(
        `INSERT INTO boletos (nome_sacado, id_lote, valor, linha_digitavel)
         VALUES (:nome_sacado, :id_lote, :valor, :linha_digitavel)`,
        {
          nome_sacado: reg.nome,
          id_lote,
          valor: parseFloat(reg.valor.toString().replace(",", ".")),
          linha_digitavel: reg.linha_digitavel
        },
        { autoCommit: true }
      );
    }

    res.status(200).send("Boletos importados com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao importar CSV.");
  }
};

exports.listarBoletos = async (req, res) => {
  try {
    const conn = await getConnection();
    const { nome, valor_inicial, valor_final, id_lote, relatorio } = req.query;

    let query = `SELECT * FROM boletos WHERE 1=1`;
    const params = [];

    if (nome) {
      query += ` AND UPPER(nome_sacado) LIKE :nome`;
      params.push(`%${nome.toUpperCase()}%`);
    }

    if (valor_inicial) {
      query += ` AND valor >= :valor_inicial`;
      params.push(parseFloat(valor_inicial));
    }

    if (valor_final) {
      query += ` AND valor <= :valor_final`;
      params.push(parseFloat(valor_final));
    }

    if (id_lote) {
      query += ` AND id_lote = :id_lote`;
      params.push(parseInt(id_lote));
    }

    const result = await conn.execute(query, params);
    const boletos = result.rows;

    if (!relatorio || relatorio !== "1") {
      return res.json(boletos);
    }

    // Geração do PDF se relatorio=1
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const bufferStream = new stream.PassThrough();
    const buffers = [];

    doc.pipe(bufferStream);

    // Título
    doc.fontSize(16).text("Relatório de Boletos", { align: "center" });
    doc.moveDown();

    // Cabeçalho da tabela
    doc.fontSize(10).text("ID", 50, doc.y, { width: 40 });
    doc.text("Nome Sacado", 90, doc.y, { width: 150 });
    doc.text("Lote", 240, doc.y, { width: 50 });
    doc.text("Valor", 290, doc.y, { width: 80 });
    doc.text("Linha Digitável", 370, doc.y, { width: 200 });
    doc.moveDown();

    boletos.forEach((boleto) => {
      doc.text(boleto.ID, 50, doc.y, { width: 40 });
      doc.text(boleto.NOME_SACADO, 90, doc.y, { width: 150 });
      doc.text(boleto.ID_LOTE, 240, doc.y, { width: 50 });
      doc.text(boleto.VALOR.toFixed(2), 290, doc.y, { width: 80 });
      doc.text(boleto.LINHA_DIGITAVEL, 370, doc.y, { width: 200 });
      doc.moveDown();
    });

    doc.end();

    bufferStream.on("data", (chunk) => buffers.push(chunk));
    bufferStream.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      const base64PDF = pdfBuffer.toString("base64");
      res.json({ base64: base64PDF });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar boletos.");
  }
};
