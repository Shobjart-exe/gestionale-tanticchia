// storage.js - Gestione completa localStorage per il gestionale

const Storage = {
    // Chiavi localStorage
    KEYS: {
        CLIENTI: 'gestionale_clienti',
        FORNITORI: 'gestionale_fornitori',
        PRODOTTI: 'gestionale_prodotti',
        MATERIE_PRIME: 'gestionale_materie_prime',
        ORDINI_IN: 'gestionale_ordini_in',
        ORDINI_OUT: 'gestionale_ordini_out',
        DOCUMENTI: 'gestionale_documenti'
    },

    // Inizializza storage con dati di esempio se vuoto
    init() {
        if (!localStorage.getItem(this.KEYS.CLIENTI)) {
            this.initSampleData();
        }
    },

    // ==== METODI GENERICI CRUD ====
    
    getAll(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id);
    },

    save(key, item) {
        const items = this.getAll(key);
        
        if (item.id) {
            // Update esistente
            const index = items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
            }
        } else {
            // Nuovo item - genera ID univoco
            item.id = this.generateUniqueId();
            item.createdAt = new Date().toISOString();
            items.push(item);
        }
        
        localStorage.setItem(key, JSON.stringify(items));
        return item;
    },

    // Genera ID univoco (timestamp + random)
    generateUniqueId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    delete(key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        return true;
    },

    // Genera codice leggibile incrementale per tipo
    generateCodice(key) {
        const items = this.getAll(key);
        const prefix = this.getPrefix(key);
        const maxId = items.reduce((max, item) => {
            const num = parseInt(item.codice?.replace(prefix, '') || 0);
            return num > max ? num : max;
        }, 0);
        return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
    },

    getPrefix(key) {
        const prefixes = {
            [this.KEYS.CLIENTI]: 'CLI',
            [this.KEYS.FORNITORI]: 'FOR',
            [this.KEYS.PRODOTTI]: 'PROD-',
            [this.KEYS.MATERIE_PRIME]: 'MAT-',
            [this.KEYS.ORDINI_IN]: 'ORD-IN-',
            [this.KEYS.ORDINI_OUT]: 'ORD-OUT-',
            [this.KEYS.DOCUMENTI]: 'DOC-'
        };
        return prefixes[key] || 'ID-';
    },

    // ==== METODI SPECIFICI PER ENTITÀ ====

    // Clienti
    getClienti() {
        return this.getAll(this.KEYS.CLIENTI);
    },

    getCliente(id) {
        return this.getById(this.KEYS.CLIENTI, id);
    },

    saveCliente(cliente) {
        if (!cliente.codice) {
            cliente.codice = this.generateCodice(this.KEYS.CLIENTI);
        }
        return this.save(this.KEYS.CLIENTI, cliente);
    },

    deleteCliente(id) {
        return this.delete(this.KEYS.CLIENTI, id);
    },

    // Fornitori
    getFornitori() {
        return this.getAll(this.KEYS.FORNITORI);
    },

    getFornitore(id) {
        return this.getById(this.KEYS.FORNITORI, id);
    },

    saveFornitore(fornitore) {
        if (!fornitore.codice) {
            fornitore.codice = this.generateCodice(this.KEYS.FORNITORI);
        }
        return this.save(this.KEYS.FORNITORI, fornitore);
    },

    deleteFornitore(id) {
        return this.delete(this.KEYS.FORNITORI, id);
    },

    // Prodotti
    getProdotti() {
        return this.getAll(this.KEYS.PRODOTTI);
    },

    getProdotto(id) {
        return this.getById(this.KEYS.PRODOTTI, id);
    },

    saveProdotto(prodotto) {
        if (!prodotto.codice) {
            prodotto.codice = this.generateCodice(this.KEYS.PRODOTTI);
        }
        return this.save(this.KEYS.PRODOTTI, prodotto);
    },

    deleteProdotto(id) {
        return this.delete(this.KEYS.PRODOTTI, id);
    },

    // Materie Prime
    getMateriePrime() {
        return this.getAll(this.KEYS.MATERIE_PRIME);
    },

    getMateriaPrima(id) {
        return this.getById(this.KEYS.MATERIE_PRIME, id);
    },

    saveMateriaPrima(materiaPrima) {
        if (!materiaPrima.codice) {
            materiaPrima.codice = this.generateCodice(this.KEYS.MATERIE_PRIME);
        }
        return this.save(this.KEYS.MATERIE_PRIME, materiaPrima);
    },

    deleteMateriaPrima(id) {
        return this.delete(this.KEYS.MATERIE_PRIME, id);
    },

    // Ordini IN
    getOrdiniIn() {
        return this.getAll(this.KEYS.ORDINI_IN);
    },

    getOrdineIn(id) {
        return this.getById(this.KEYS.ORDINI_IN, id);
    },

    saveOrdineIn(ordine) {
        if (!ordine.codice) {
            ordine.codice = this.generateCodice(this.KEYS.ORDINI_IN);
        }
        return this.save(this.KEYS.ORDINI_IN, ordine);
    },

    deleteOrdineIn(id) {
        return this.delete(this.KEYS.ORDINI_IN, id);
    },

    // Ordini OUT
    getOrdiniOut() {
        return this.getAll(this.KEYS.ORDINI_OUT);
    },

    getOrdineOut(id) {
        return this.getById(this.KEYS.ORDINI_OUT, id);
    },

    saveOrdineOut(ordine) {
        if (!ordine.codice) {
            ordine.codice = this.generateCodice(this.KEYS.ORDINI_OUT);
        }
        return this.save(this.KEYS.ORDINI_OUT, ordine);
    },

    deleteOrdineOut(id) {
        return this.delete(this.KEYS.ORDINI_OUT, id);
    },

    // Documenti
    getDocumenti() {
        return this.getAll(this.KEYS.DOCUMENTI);
    },

    getDocumento(id) {
        return this.getById(this.KEYS.DOCUMENTI, id);
    },

    saveDocumento(documento) {
        if (!documento.codice) {
            documento.codice = this.generateCodice(this.KEYS.DOCUMENTI);
        }
        return this.save(this.KEYS.DOCUMENTI, documento);
    },

    deleteDocumento(id) {
        return this.delete(this.KEYS.DOCUMENTI, id);
    },

    // Ricerca
    search(key, query) {
        const items = this.getAll(key);
        const lowerQuery = query.toLowerCase();
        
        return items.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(lowerQuery)
            );
        });
    },

    // Inizializza storage vuoto - l'utente riempirà i dati
    initSampleData() {
        // Inizializza con array vuoti
        localStorage.setItem(this.KEYS.CLIENTI, JSON.stringify([]));
        localStorage.setItem(this.KEYS.FORNITORI, JSON.stringify([]));
        localStorage.setItem(this.KEYS.PRODOTTI, JSON.stringify([]));
        localStorage.setItem(this.KEYS.MATERIE_PRIME, JSON.stringify([]));
        localStorage.setItem(this.KEYS.ORDINI_IN, JSON.stringify([]));
        localStorage.setItem(this.KEYS.ORDINI_OUT, JSON.stringify([]));
        localStorage.setItem(this.KEYS.DOCUMENTI, JSON.stringify([]));
    },

    // Reset completo
    reset() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initSampleData();
    }
};

// Inizializza storage all'avvio
Storage.init();
