-- schema.sql - Schema completo database per Gestionale Sartoria
-- Esegui questo script su Supabase Dashboard > SQL Editor

-- ==== IMPORTANTE ====
-- Prima di eseguire questo script:
-- 1. Vai su Supabase Dashboard
-- 2. Seleziona il tuo progetto
-- 3. Vai su SQL Editor (icona </> nella sidebar)
-- 4. Copia e incolla tutto questo script
-- 5. Clicca "Run" per eseguirlo

-- ==== PULIZIA (opzionale - decommentare se vuoi ricreare le tabelle) ====
-- DROP TABLE IF EXISTS documenti CASCADE;
-- DROP TABLE IF EXISTS ordini_out CASCADE;
-- DROP TABLE IF EXISTS ordini_in CASCADE;
-- DROP TABLE IF EXISTS materie_prime CASCADE;
-- DROP TABLE IF EXISTS prodotti CASCADE;
-- DROP TABLE IF EXISTS fornitori CASCADE;
-- DROP TABLE IF EXISTS clienti CASCADE;

-- ==== ESTENSIONI ====
-- Abilita l'estensione per UUID (se non già abilitata)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==== TABELLA CLIENTI ====
CREATE TABLE IF NOT EXISTS clienti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    indirizzo TEXT,
    citta TEXT,
    cap TEXT,
    provincia TEXT,
    partita_iva TEXT,
    codice_fiscale TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_clienti_codice ON clienti(codice);
CREATE INDEX IF NOT EXISTS idx_clienti_nome ON clienti(nome);
CREATE INDEX IF NOT EXISTS idx_clienti_email ON clienti(email);

-- ==== TABELLA FORNITORI ====
CREATE TABLE IF NOT EXISTS fornitori (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    indirizzo TEXT,
    citta TEXT,
    cap TEXT,
    provincia TEXT,
    partita_iva TEXT,
    codice_fiscale TEXT,
    iban TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fornitori_codice ON fornitori(codice);
CREATE INDEX IF NOT EXISTS idx_fornitori_nome ON fornitori(nome);

-- ==== TABELLA PRODOTTI ====
CREATE TABLE IF NOT EXISTS prodotti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descrizione TEXT,
    categoria TEXT,
    unita_misura TEXT DEFAULT 'pz',
    prezzo_vendita DECIMAL(10,2) DEFAULT 0,
    costo_produzione DECIMAL(10,2) DEFAULT 0,
    quantita_disponibile INTEGER DEFAULT 0,
    quantita_minima INTEGER DEFAULT 0,
    stato TEXT DEFAULT 'libera', -- libera, prenotata, usata
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prodotti_codice ON prodotti(codice);
CREATE INDEX IF NOT EXISTS idx_prodotti_nome ON prodotti(nome);
CREATE INDEX IF NOT EXISTS idx_prodotti_stato ON prodotti(stato);

-- ==== TABELLA MATERIE PRIME ====
CREATE TABLE IF NOT EXISTS materie_prime (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descrizione TEXT,
    categoria TEXT,
    unita_misura TEXT DEFAULT 'mt',
    prezzo_acquisto DECIMAL(10,2) DEFAULT 0,
    quantita_disponibile DECIMAL(10,2) DEFAULT 0,
    quantita_minima DECIMAL(10,2) DEFAULT 0,
    fornitore_id UUID REFERENCES fornitori(id) ON DELETE SET NULL,
    stato TEXT DEFAULT 'libera', -- libera, prenotata, usata
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materie_prime_codice ON materie_prime(codice);
CREATE INDEX IF NOT EXISTS idx_materie_prime_nome ON materie_prime(nome);
CREATE INDEX IF NOT EXISTS idx_materie_prime_stato ON materie_prime(stato);
CREATE INDEX IF NOT EXISTS idx_materie_prime_fornitore ON materie_prime(fornitore_id);

-- ==== TABELLA ORDINI IN (da fornitori) ====
CREATE TABLE IF NOT EXISTS ordini_in (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice TEXT UNIQUE NOT NULL,
    numero_ordine TEXT,
    fornitore_id UUID REFERENCES fornitori(id) ON DELETE SET NULL,
    fornitore_nome TEXT, -- Denormalizzato per velocità
    data_ordine DATE NOT NULL DEFAULT CURRENT_DATE,
    data_consegna_prevista DATE,
    data_consegna_effettiva DATE,
    stato TEXT DEFAULT 'attesa', -- attesa, parziale, evaso, annullato
    totale DECIMAL(10,2) DEFAULT 0,
    note TEXT,
    articoli JSONB DEFAULT '[]', -- Array di {prodotto_id, nome, quantita, prezzo}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordini_in_codice ON ordini_in(codice);
CREATE INDEX IF NOT EXISTS idx_ordini_in_stato ON ordini_in(stato);
CREATE INDEX IF NOT EXISTS idx_ordini_in_fornitore ON ordini_in(fornitore_id);
CREATE INDEX IF NOT EXISTS idx_ordini_in_data ON ordini_in(data_ordine DESC);

-- ==== TABELLA ORDINI OUT (a clienti) ====
CREATE TABLE IF NOT EXISTS ordini_out (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice TEXT UNIQUE NOT NULL,
    numero_ordine TEXT,
    cliente_id UUID REFERENCES clienti(id) ON DELETE SET NULL,
    cliente_nome TEXT, -- Denormalizzato per velocità
    data_ordine DATE NOT NULL DEFAULT CURRENT_DATE,
    data_consegna_prevista DATE,
    data_consegna_effettiva DATE,
    stato TEXT DEFAULT 'attesa', -- attesa, in_lavorazione, pronto, consegnato, annullato
    totale DECIMAL(10,2) DEFAULT 0,
    acconto DECIMAL(10,2) DEFAULT 0,
    saldo DECIMAL(10,2) DEFAULT 0,
    note TEXT,
    articoli JSONB DEFAULT '[]', -- Array di {prodotto_id, nome, quantita, prezzo}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordini_out_codice ON ordini_out(codice);
CREATE INDEX IF NOT EXISTS idx_ordini_out_stato ON ordini_out(stato);
CREATE INDEX IF NOT EXISTS idx_ordini_out_cliente ON ordini_out(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordini_out_data ON ordini_out(data_ordine DESC);

-- ==== TABELLA DOCUMENTI ====
CREATE TABLE IF NOT EXISTS documenti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL, -- fattura, preventivo, ddt, ricevuta, etc.
    numero TEXT,
    data_documento DATE NOT NULL DEFAULT CURRENT_DATE,
    cliente_id UUID REFERENCES clienti(id) ON DELETE SET NULL,
    cliente_nome TEXT,
    fornitore_id UUID REFERENCES fornitori(id) ON DELETE SET NULL,
    fornitore_nome TEXT,
    importo DECIMAL(10,2) DEFAULT 0,
    iva DECIMAL(10,2) DEFAULT 0,
    totale DECIMAL(10,2) DEFAULT 0,
    stato TEXT DEFAULT 'bozza', -- bozza, emesso, pagato, annullato
    note TEXT,
    file_url TEXT, -- URL del file PDF se salvato su Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documenti_codice ON documenti(codice);
CREATE INDEX IF NOT EXISTS idx_documenti_tipo ON documenti(tipo);
CREATE INDEX IF NOT EXISTS idx_documenti_stato ON documenti(stato);
CREATE INDEX IF NOT EXISTS idx_documenti_cliente ON documenti(cliente_id);
CREATE INDEX IF NOT EXISTS idx_documenti_fornitore ON documenti(fornitore_id);
CREATE INDEX IF NOT EXISTS idx_documenti_data ON documenti(data_documento DESC);

-- ==== FUNZIONI HELPER ====

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare updated_at su tutte le tabelle
CREATE TRIGGER update_clienti_updated_at BEFORE UPDATE ON clienti
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fornitori_updated_at BEFORE UPDATE ON fornitori
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prodotti_updated_at BEFORE UPDATE ON prodotti
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materie_prime_updated_at BEFORE UPDATE ON materie_prime
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordini_in_updated_at BEFORE UPDATE ON ordini_in
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordini_out_updated_at BEFORE UPDATE ON ordini_out
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documenti_updated_at BEFORE UPDATE ON documenti
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==== ROW LEVEL SECURITY (RLS) ====
-- Per sviluppo, disabilitiamo RLS per permettere accesso completo
-- In produzione, dovrai configurare policy più restrittive

ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornitori ENABLE ROW LEVEL SECURITY;
ALTER TABLE prodotti ENABLE ROW LEVEL SECURITY;
ALTER TABLE materie_prime ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordini_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordini_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE documenti ENABLE ROW LEVEL SECURITY;

-- Policy di accesso completo per utenti autenticati (permissive per sviluppo)
-- IMPORTANTE: In produzione, personalizza queste policy in base alle tue esigenze

CREATE POLICY "Allow all for authenticated users" ON clienti
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON fornitori
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON prodotti
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON materie_prime
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON ordini_in
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON ordini_out
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON documenti
    FOR ALL USING (true) WITH CHECK (true);

-- ==== DATI DI ESEMPIO (opzionale) ====
-- Decommentare se vuoi inserire alcuni dati di test

/*
-- Cliente di esempio
INSERT INTO clienti (codice, nome, email, telefono, citta)
VALUES ('CLI001', 'Mario Rossi', 'mario.rossi@email.com', '333-1234567', 'Milano');

-- Fornitore di esempio
INSERT INTO fornitori (codice, nome, email, telefono, citta)
VALUES ('FOR001', 'Tessuti Spa', 'info@tessuti.com', '02-123456', 'Como');

-- Prodotto di esempio
INSERT INTO prodotti (codice, nome, categoria, prezzo_vendita, quantita_disponibile)
VALUES ('PROD-001', 'Abito da sera', 'Abbigliamento', 299.99, 5);

-- Materia prima di esempio
INSERT INTO materie_prime (codice, nome, categoria, unita_misura, prezzo_acquisto, quantita_disponibile)
VALUES ('MAT-001', 'Seta rossa', 'Tessuti', 'mt', 25.50, 100);
*/

-- ==== FINE SCRIPT ====
-- Se lo script è stato eseguito con successo, vedrai il messaggio "Success"
-- Controlla la console per eventuali errori

-- Log di successo
DO $$
BEGIN
    RAISE NOTICE '✅ Schema database creato con successo!';
    RAISE NOTICE '📊 Tabelle create: clienti, fornitori, prodotti, materie_prime, ordini_in, ordini_out, documenti';
    RAISE NOTICE '🔒 RLS abilitato su tutte le tabelle';
    RAISE NOTICE '🚀 Il tuo gestionale è pronto per l\'uso!';
END $$;
 -- ==== TABELLA RICETTE ====
CREATE TABLE IF NOT EXISTS ricette (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prodotto_id UUID REFERENCES prodotti(id) ON DELETE CASCADE,
    materia_prima_id UUID REFERENCES materie_prime(id) ON DELETE CASCADE,
    quantita_necessaria DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==== AUTOMATISMO 1: CARICO MAGAZZINO (ORDINI IN) ====
-- Quando un ordine_in passa a 'evaso', aumenta le materie prime
CREATE OR REPLACE FUNCTION funzione_carico_materie_prime()
RETURNS TRIGGER AS $$
DECLARE
    articolo RECORD;
BEGIN
    -- Se l'ordine passa a 'evaso'
    IF (NEW.stato = 'evaso' AND OLD.stato != 'evaso') THEN
        -- Gli articoli sono salvati nel JSONB 'articoli'
        -- Struttura prevista: {materia_id, quantita}
        FOR articolo IN SELECT * FROM jsonb_to_recordset(NEW.articoli) AS x(materia_id UUID, quantita DECIMAL)
        LOOP
            UPDATE materie_prime
            SET quantita_disponibile = quantita_disponibile + articolo.quantita
            WHERE id = articolo.materia_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_carico_magazzino
AFTER UPDATE ON ordini_in
FOR EACH ROW EXECUTE FUNCTION funzione_carico_materie_prime();

-- ==== AUTOMATISMO 2: SCARICO MAGAZZINO (CRAFTING/ORDINI OUT) ====
-- Quando un ordine_out passa a 'in_lavorazione', scarica le materie prime basandosi sulle ricette
CREATE OR REPLACE FUNCTION funzione_scarico_per_crafting()
RETURNS TRIGGER AS $$
DECLARE
    articolo_ordine RECORD;
    componente_ricetta RECORD;
BEGIN
    IF (NEW.stato = 'in_lavorazione' AND OLD.stato != 'in_lavorazione') THEN
        -- Per ogni prodotto nell'ordine
        FOR articolo_ordine IN SELECT * FROM jsonb_to_recordset(NEW.articoli) AS x(prodotto_id UUID, quantita INTEGER)
        LOOP
            -- Cerca i componenti nella tabella ricette
            FOR componente_ricetta IN SELECT materia_prima_id, quantita_necessaria FROM ricette WHERE prodotto_id = articolo_ordine.prodotto_id
            LOOP
                -- Sottrai dal magazzino: (quantità necessaria nella ricetta * quantità prodotti ordinati)
                UPDATE materie_prime
                SET quantita_disponibile = quantita_disponibile - (componente_ricetta.quantita_necessaria * articolo_ordine.quantita)
                WHERE id = componente_ricetta.materia_prima_id;
            END LOOP;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_scarico_magazzino
AFTER UPDATE ON ordini_out
FOR EACH ROW EXECUTE FUNCTION funzione_scarico_per_crafting();