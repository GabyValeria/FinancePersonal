-- app/schema.sql 
DROP TABLE IF EXISTS transacoes;
DROP TABLE IF EXISTS orcamentos;
DROP TABLE IF EXISTS metas;

CREATE TABLE transacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
  categoria TEXT,
  data DATE NOT NULL DEFAULT (date('now', 'localtime'))
);

-- Tabela de Orçamentos
CREATE TABLE orcamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL UNIQUE,
    limite REAL NOT NULL
);

-- Tabela de Metas
CREATE TABLE metas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    valor_alvo REAL NOT NULL,
    valor_atual REAL NOT NULL DEFAULT 0
);
