# Gestionale - Sistema CRUD JavaScript

Sistema gestionale completo con funzionalità CRUD (Create, Read, Update, Delete) implementato in JavaScript vanilla con localStorage.

## 🎯 Funzionalità Implementate

### ✅ **Clienti** - CRUD Completo
- **Lista dinamica** con ricerca in tempo reale
- **Crea nuovo** cliente con form validato
- **Visualizza** dettaglio cliente (readonly)
- **Modifica** dati cliente esistente
- **Elimina** cliente con conferma

### ✅ **Fornitori** - CRUD Completo
- **Lista dinamica** con ricerca in tempo reale
- **Crea nuovo** fornitore con form validato
- **Visualizza** dettaglio fornitore (readonly)
- **Modifica** dati fornitore esistente
- **Elimina** fornitore con conferma

## 📁 Struttura Progetto

```
nuovo-gestionale/
├── index.html                      # Dashboard principale
├── clienti.html                    # Lista clienti dinamica
├── fornitori.html                  # Lista fornitori dinamica
├── clienti/
│   └── dettaglio.html             # Form CRUD clienti
├── fornitori/
│   └── dettaglio.html             # Form CRUD fornitori
├── js/
│   ├── storage.js                 # Gestione localStorage (database)
│   ├── utils.js                   # Funzioni helper
│   └── pages/
│       ├── clienti.js             # Logica lista clienti
│       ├── clienti-dettaglio.js   # Logica CRUD clienti
│       ├── fornitori.js           # Logica lista fornitori
│       └── fornitori-dettaglio.js # Logica CRUD fornitori
└── styles/
    └── main.css                   # Stili compilati da SASS
```

## 🚀 Come Usare

### 1. **Aprire il Sito**
Apri `index.html` nel browser (no server necessario!)

### 2. **Testare Clienti**

#### **Visualizzare Lista**
1. Click su "Clienti" nel menu
2. Vedi lista caricata da localStorage
3. Usa ricerca per filtrare

#### **Creare Cliente**
1. Click "Nuovo Cliente"
2. Compila form (campi obbligatori: Ragione Sociale, P.IVA, Email, Telefono)
3. Click "Salva"
4. Redirect automatico alla lista

#### **Modificare Cliente**
1. Click su una riga nella lista
2. Click "Modifica"
3. Modifica campi
4. Click "Salva" o "Annulla"

#### **Eliminare Cliente**
1. Apri dettaglio cliente
2. Click "Elimina"
3. Conferma eliminazione

### 3. **Testare Fornitori**
Stessi passi dei clienti (menu → Fornitori)

## 💾 Persistenza Dati

### **localStorage come Database**
I dati sono salvati nel browser in `localStorage` con queste chiavi:
- `gestionale_clienti` - Array di clienti
- `gestionale_fornitori` - Array di fornitori
- `gestionale_prodotti` - Array di prodotti
- `gestionale_materie_prime` - Array di materie prime

### **Dati di Esempio Precaricati**
Al primo avvio, vengono creati automaticamente:
- 3 clienti di esempio
- 2 fornitori di esempio
- 2 prodotti di esempio
- 2 materie prime di esempio

### **Reset Dati**
Per resettare tutti i dati, apri console browser e digita:
```javascript
Storage.reset();
location.reload();
```

## 🔧 API Storage

### **Metodi Disponibili**

```javascript
// CLIENTI
Storage.getClienti()              // Ottieni tutti
Storage.getCliente(id)            // Ottieni uno
Storage.saveCliente(cliente)      // Crea/Aggiorna
Storage.deleteCliente(id)         // Elimina

// FORNITORI
Storage.getFornitori()
Storage.getFornitore(id)
Storage.saveFornitore(fornitore)
Storage.deleteFornitore(id)

// PRODOTTI
Storage.getProdotti()
Storage.getProdotto(id)
Storage.saveProdotto(prodotto)
Storage.deleteProdotto(id)

// MATERIE PRIME
Storage.getMateriePrime()
Storage.getMateriaPrima(id)
Storage.saveMateriaPrima(materiaPrima)
Storage.deleteMateriaPrima(id)
```

## 🎨 Features

### **Form Intelligente**
- 3 modalità: View (readonly), Edit (editabile), Create (nuovo)
- Toggle automatico readonly
- Validazione campi obbligatori
- Generazione automatica codici ID

### **UI Dinamica**
- Liste popolate da localStorage
- Ricerca real-time con debounce
- Notifiche toast per feedback
- Pulsanti context-aware

### **Navigazione**
- URL con parametri: `?id=CLI001` o `?mode=create`
- Click riga → dettaglio
- Breadcrumb dinamici

## 📊 Struttura Dati

### **Cliente**
```javascript
{
  id: "CLI001",
  codice: "CLI001",
  ragioneSociale: "Rossi Spa",
  piva: "IT12345678901",
  email: "info@rossi.it",
  telefono: "02 1234567",
  indirizzo: "Via Veneto 45",
  cap: "20121",
  citta: "Milano",
  provincia: "MI",
  stato: "Attivo",
  createdAt: "2025-12-22T06:00:00.000Z"
}
```

### **Fornitore**
```javascript
{
  id: "FOR001",
  codice: "FOR001",
  ragioneSociale: "Tessuti Italia Srl",
  piva: "IT11223344556",
  categoria: "Materie Prime",
  email: "vendite@tessuti.it",
  telefono: "031 1234567",
  citta: "Como",
  stato: "Attivo",
  createdAt: "2025-12-22T06:00:00.000Z"
}
```

## 🔜 Prossime Implementazioni

Per completare il sistema, replicare lo stesso pattern per:
- [ ] **Prodotti** (con giacenze)
- [ ] **Materie Prime** (con giacenze e fornitori)
- [ ] **Documenti** (più semplice)
- [ ] **Ordini** (con articoli nested)

## 🛠️ Tecnologie

- **HTML5** - Struttura
- **Bulma CSS** - Framework UI
- **SASS** - Preprocessore CSS
- **JavaScript Vanilla** - Logica
- **localStorage** - Persistenza dati
- **No Backend** - 100% client-side

## 📝 Note Tecniche

### **Vantaggi Approccio**
✅ Zero dipendenze esterne (no jQuery, no framework)
✅ Funziona offline
✅ Instant feedback
✅ Facile da debuggare
✅ Pronto per migrazione a backend

### **Limitazioni localStorage**
- Limit ~5-10MB per dominio
- Solo text/JSON (no file binari)
- Perso se cache browser cancellata
- Non condivisibile tra utenti

### **Migrazione Futura a Backend**
Per passare a un backend (Node.js/Express):
1. Sostituire `Storage.getClienti()` con `fetch('/api/clienti')`
2. Mantenere stessa struttura dati
3. Aggiungere autenticazione
4. Il resto del codice rimane identico!

## 🎓 Pattern Utilizzati

- **Module Pattern** - Ogni pagina ha il suo oggetto (ClientiPage, FornitoriDettaglio, etc.)
- **Observer Pattern** - Event listeners per interazioni
- **Strategy Pattern** - Modalità view/edit/create
- **Factory Pattern** - Generazione ID univoci
- **Repository Pattern** - Storage come layer dati

## 📧 Supporto

Per domande o problemi, consulta il codice sorgente ben commentato in `js/storage.js` e `js/utils.js`.

---

**Buon lavoro! 🚀**
