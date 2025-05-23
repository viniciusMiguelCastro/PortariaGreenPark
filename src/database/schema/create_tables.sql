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