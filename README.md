# 🏢 Portaria Green Park — API de Importação de Boletos

Esta API simula a integração entre dois sistemas utilizados por um condomínio residencial. A aplicação permite importar boletos gerados por um sistema financeiro (em formatos .csv e .pdf) e integrá-los ao sistema da portaria, realizando o mapeamento de unidades, armazenamento em banco Oracle e fornecendo endpoints REST para consulta e geração de relatórios.


## 📚 Sumário

- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Instalação e Execução](#-instalação-e-execução)
- [Scripts SQL](#-scripts-sql)
- [Estrutura do Banco de Dados](#-estrutura-do-banco-de-dados-oracle)
- [Arquivos de Exemplo](#-arquivos-de-exemplo)
- [Exemplo de Arquivo CSV](#-exemplo-de-arquivo-csv)
- [Endpoints](#-endpoints)




⚙️ Tecnologias Utilizadas

    Node.js

    Express

    OracleDB

    Multer — Upload de arquivos

    CSV Parser

    PDFKit / PDF-Lib — Leitura e geração de PDFs

    Dotenv — Variáveis de ambiente

🧩 Funcionalidades
✅ 1. Importação de Boletos via .csv

Endpoint: POST /boletos/importar-csv

    Upload de arquivos .csv contendo as colunas:
        nome;unidade;valor;linha_digitavel

    Cada linha é convertida em um registro na tabela boletos.

    O campo unidade é automaticamente mapeado para o id_lote.    


🧠 2. Mapeamento Automático de Unidades

    Durante a importação, o valor da coluna unidade (ex: 17) é convertido para o nome padrão do lote (ex: 0017), e o respectivo id da tabela lotes é utilizado no relacionamento.


📄 3. Upload e Divisão de PDF

Endpoint: POST /pdf/upload-pdf

    Recebe um arquivo .pdf contendo boletos (um por página).

    O arquivo é dividido em páginas individuais e cada boleto é salvo com o nome do id correspondente ao boleto cadastrado no sistema.

Exemplo de saída:
```
/pdfs/
├── 1.pdf
├── 2.pdf
└── 3.pdf
```


🔍 4. Consulta de Boletos

Endpoint: GET /boletos

    Lista os boletos cadastrados.

    Suporta filtros por:

        nome

        valor_inicial e valor_final

        id_lote


📊 5. Geração de Relatório em PDF (Base64)

    Endpoint: GET /boletos?relatorio=1

        Gera um relatório em PDF com os boletos encontrados.

        O retorno é uma string Base64 representando o conteúdo do PDF.

    Exemplo de resposta:

        {
    "base64": "JVBERi0xLjQKJ..."
    }


📦 Instalação e Execução

    Pré-requisitos:

        Node.js instalado

        Banco Oracle configurado

        Arquivo .env com as variáveis de ambiente


Instalação:

    git clone https://github.com/seu-usuario/portaria-green-park.git
    cd portaria-green-park
    npm install


Execução:

    npm start


📂 Scripts SQL

Os scripts de criação e inserção inicial estão localizados em:

- `database/schema/create_tables.sql` — Criação das tabelas `lotes` e `boletos`
- `database/seed/insert_lotes.sql` — Inserção de lotes iniciais para testes


🗄️ Estrutura do Banco de Dados (Oracle)

    CREATE TABLE lotes (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(100),
    ativo NUMBER(1) DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE boletos (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_sacado VARCHAR2(255),
    id_lote NUMBER,
    valor DECIMAL(10, 2),
    linha_digitavel VARCHAR2(255),
    ativo NUMBER(1) DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lote FOREIGN KEY (id_lote) REFERENCES lotes(id)
    );


Inserção de dados de exemplo para a tabela de lotes:

    INSERT INTO lotes (nome) VALUES ('1010');
    INSERT INTO lotes (nome) VALUES ('2020');
    INSERT INTO lotes (nome) VALUES ('3030');


📂 Arquivos de Exemplo

Para facilitar os testes, arquivos `.csv` e `.pdf` de exemplo estão disponíveis na pasta `examples/`:

- `examples/boletos.csv` — Exemplo de importação de boletos
- `examples/boletos.pdf` — PDF com páginas de boletos para teste de divisão

Você pode usá-los diretamente nos endpoints de upload.


📂 Exemplo de Arquivo CSV

    nome;unidade;valor;linha_digitavel
    Marcia da Silva;1010;350.75;23793381286000000002996000000010482440000035075
    Jose Souza;2020;450.00;23793381286000000002996000000010482440000045000
    Marcos Roberto;3030;250.00;237933812860000000029960000000104


🔗 Endpoints
📤 Importação de CSV

    POST http://localhost:3000/boletos/importar-csv

    Enviar via form-data:

        key: arquivo

        value: selecione o arquivo .csv

    O arquivo será salvo em: /uploads/csv

📤 Upload de PDF

    POST http://localhost:3000/pdf/upload-pdf

    Enviar via form-data:

        key: pdf

        value: selecione o arquivo .pdf

    Os arquivos individuais serão salvos em: /uploads/pdf

📥 Consulta de Boletos

    GET http://localhost:3000/boletos

    Lista todos os boletos.

    Com filtros:

    GET http://localhost:3000/boletos?nome=MARCOS&valor_inicial=100&valor_final=500&id_lote=3
🧾 Geração de Relatório

    GET http://localhost:3000/boletos?relatorio=1

    Retorna o relatório em PDF no formato Base64.

 