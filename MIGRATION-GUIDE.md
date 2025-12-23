# 🚀 Guida Completa alla Migrazione Supabase

Questa guida ti aiuterà a migrare il tuo gestionale da localStorage a Supabase.

---

## 📋 INDICE

1. [Setup Iniziale](#setup-iniziale)
2. [Differenze localStorage vs Supabase](#differenze-localstorage-vs-supabase)
3. [Come Trasformare il Codice](#come-trasformare-il-codice)
4. [Esempi Pratici](#esempi-pratici)
5. [Gestione Errori](#gestione-errori)
6. [Testing](#testing)
7. [FAQ](#faq)

---

## 🎯 SETUP INIZIALE

### Passo 1: Esegui lo Schema SQL

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard/project/lkjkuqizpauustexolcu)
2. Nella sidebar, clicca su **SQL Editor** (icona `</>`)
3. Clicca su **New Query**
4. Copia tutto il contenuto del file `sql/schema.sql`
5. Incolla nell'editor e clicca **Run**
6. Dovresti vedere il messaggio "Success. No rows returned"

### Passo 2: Verifica le Tabelle

1. Vai su **Table Editor** nella sidebar
2. Dovresti vedere 7 tabelle create:
   - `clienti`
   - `fornitori`
   - `prodotti`
   - `materie_prime`
   - `ordini_in`
   - `ordini_out`
   - `documenti`

### Passo 3: Aggiungi gli Script a Tutte le Pagine HTML

In **OGNI** pagina HTML del progetto (index.html, clienti.html, fornitori.html, ecc.), aggiungi prima del `</body>`:

```html
<!-- SDK Supabase da CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Script Supabase -->
<script src="js/supabase-config.js"></script>
<script src="js/supabase-storage.js"></script>
<script src="js/supabase-init.js"></script>

<!-- IMPORTANTE: Aggiusta il path relativo in base alla posizione della pagina -->
<!-- Per pagine in sottocartelle (es: clienti/dettaglio.html) usa: -->
<script src="../js/supabase-config.js"></script>
<script src="../js/supabase-storage.js"></script>
<script src="../js/supabase-init.js"></script>
```

---

## 🔄 DIFFERENZE localStorage vs Supabase

### localStorage (SINCRONO - Vecchio)
```javascript
// ✅ Esecuzione IMMEDIATA
const clienti = Storage.getClienti();
console.log(clienti); // Array disponibile subito
```

### Supabase (ASINCRONO - Nuovo)
```javascript
// ⏳ Esecuzione ASINCRONA (richiede await)
const clienti = await SupabaseStorage.getClienti();
console.log(clienti); // Array disponibile dopo risposta server
```

### Regola Fondamentale

**TUTTE le funzioni che usano SupabaseStorage DEVONO essere `async` e usare `await`**

---

## 🛠️ COME TRASFORMARE IL CODICE

### Esempio 1: Funzione Semplice

**PRIMA (localStorage):**
```javascript
function caricaClienti() {
    const clienti = Storage.getClienti();
    mostraClienti(clienti);
}
```

**DOPO (Supabase):**
```javascript
async function caricaClienti() {
    const clienti = await SupabaseStorage.getClienti();
    mostraClienti(clienti);
}
```

### Esempio 2: Event Listener

**PRIMA:**
```javascript
document.getElementById('btnSalva').addEventListener('click', function() {
    const cliente = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value
    };
    Storage.saveCliente(cliente);
    alert('Salvato!');
});
```

**DOPO:**
```javascript
document.getElementById('btnSalva').addEventListener('click', async function() {
    const cliente = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value
    };
    
    const salvato = await SupabaseStorage.saveCliente(cliente);
    
    if (salvato) {
        alert('Salvato con successo!');
    } else {
        alert('Errore nel salvataggio!');
    }
});
```

### Esempio 3: Caricamento Pagina

**PRIMA:**
```javascript
window.addEventListener('DOMContentLoaded', function() {
    const clienti = Storage.getClienti();
    mostraInTabella(clienti);
});
```

**DOPO:**
```javascript
window.addEventListener('DOMContentLoaded', async function() {
    const clienti = await SupabaseStorage.getClienti();
    mostraInTabella(clienti);
});
```

---

## 💡 ESEMPI PRATICI

### CREATE - Salvare un nuovo Cliente

```javascript
async function salvaContatto(nuovoContatto) {
    try {
        // Il metodo saveCliente gestisce automaticamente:
        // - Generazione del codice (CLI001, CLI002, etc.)
        // - Generazione UUID
        // - Timestamp created_at
        const salvato = await SupabaseStorage.saveCliente(nuovoContatto);
        
        if (salvato) {
            console.log('✅ Cliente salvato:', salvato);
            console.log('ID generato:', salvato.id);
            console.log('Codice generato:', salvato.codice);
            return salvato;
        } else {
            console.error('❌ Errore nel salvataggio');
            return null;
        }
    } catch (error) {
        console.error('❌ Eccezione:', error);
        return null;
    }
}

// Uso:
const nuovoCliente = {
    nome: 'Mario Rossi',
    email: 'mario.rossi@email.com',
    telefono: '333-1234567',
    citta: 'Milano'
};

const result = await salvaContatto(nuovoCliente);
```

### READ - Leggere tutti i Contatti (ordinati per nome)

```javascript
async function leggiContatti() {
    try {
        // Recupera tutti i clienti ordinati per nome (A-Z)
        const contatti = await SupabaseStorage.getClienti();
        
        console.log(`✅ Trovati ${contatti.length} contatti`);
        
        contatti.forEach(contatto => {
            console.log(`${contatto.codice} - ${contatto.nome}`);
        });
        
        return contatti;
        
    } catch (error) {
        console.error('❌ Errore nel recupero:', error);
        return [];
    }
}

// Uso:
const tuttiIContatti = await leggiContatti();
```

### READ - Leggere un Singolo Contatto

```javascript
async function leggiContatto(id) {
    try {
        const contatto = await SupabaseStorage.getCliente(id);
        
        if (contatto) {
            console.log('✅ Contatto trovato:', contatto.nome);
            return contatto;
        } else {
            console.log('⚠️ Contatto non trovato');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Errore:', error);
        return null;
    }
}

// Uso:
const cliente = await leggiContatto('uuid-del-cliente');
```

### UPDATE - Aggiornare un Contatto

```javascript
async function aggiornaContatto(id, modifiche) {
    try {
        // Prima recupero il contatto esistente
        const contattoEsistente = await SupabaseStorage.getCliente(id);
        
        if (!contattoEsistente) {
            console.error('❌ Contatto non trovato');
            return null;
        }
        
        // Merge delle modifiche con i dati esistenti
        const contattoAggiornato = {
            ...contattoEsistente,
            ...modifiche
        };
        
        // Salvo (saveCliente riconosce l'ID e fa UPDATE)
        const salvato = await SupabaseStorage.saveCliente(contattoAggiornato);
        
        if (salvato) {
            console.log('✅ Contatto aggiornato');
            return salvato;
        }
        
    } catch (error) {
        console.error('❌ Errore nell\'aggiornamento:', error);
        return null;
    }
}

// Uso:
await aggiornaContatto('uuid-cliente', {
    telefono: '333-9999999',
    email: 'nuova@email.com'
});
```

### DELETE - Eliminare un Contatto

```javascript
async function eliminaContatto(id) {
    try {
        const conferma = confirm('Sei sicuro di voler eliminare questo contatto?');
        
        if (!conferma) {
            return false;
        }
        
        const eliminato = await SupabaseStorage.deleteCliente(id);
        
        if (eliminato) {
            console.log('✅ Contatto eliminato');
            return true;
        } else {
            console.error('❌ Errore nell\'eliminazione');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Errore:', error);
        return false;
    }
}

// Uso:
const success = await eliminaContatto('uuid-cliente');
```

### SEARCH - Cercare Contatti

```javascript
async function cercaContatti(query) {
    try {
        // Cerca nei campi: nome, codice, email, telefono
        const risultati = await SupabaseStorage.searchClienti(query);
        
        console.log(`✅ Trovati ${risultati.length} risultati per "${query}"`);
        
        return risultati;
        
    } catch (error) {
        console.error('❌ Errore nella ricerca:', error);
        return [];
    }
}

// Uso:
const trovati = await cercaContatti('Mario');
```

---

## ⚠️ GESTIONE ERRORI

### Blocco Try-Catch (Consigliato)

```javascript
async function operazioneConErrori() {
    try {
        const clienti = await SupabaseStorage.getClienti();
        
        // Il tuo codice qui
        
    } catch (error) {
        // Gestisci l'errore
        console.error('Errore:', error.message);
        
        // Mostra messaggio all'utente
        alert('Si è verificato un errore. Riprova più tardi.');
        
        // Ritorna valore sicuro
        return [];
    }
}
```

### Controllo del Risultato

```javascript
async function operazioneConControllo() {
    const salvato = await SupabaseStorage.saveCliente(cliente);
    
    if (!salvato) {
        // Il metodo ha già loggato l'errore nella console
        alert('Impossibile salvare il cliente');
        return;
    }
    
    // Continua con il successo
    console.log('Operazione completata');
}
```

---

## 🧪 TESTING

### Test 1: Verifica Connessione

Apri `index.html` nel browser e controlla la console (F12):

✅ **SUCCESSO** - Dovresti vedere:
```
✅ Client Supabase inizializzato correttamente
📍 URL: https://lkjkuqizpauustexolcu.supabase.co
✅ SupabaseStorage caricato e pronto all'uso
📊 Tabelle disponibili: clienti, fornitori, prodotti, ...
🔄 Inizializzazione Supabase in corso...
🔍 Test connessione al database...
✅ Connessione al database verificata con successo!
📊 Sistema pronto per l'uso
```

⚠️ **ATTENZIONE** - Se vedi questo banner arancione:
```
⚠️ Database non configurato
Le tabelle del database non sono state ancora create.
```
Significa che devi eseguire lo script SQL (vedi Passo 1 sopra).

### Test 2: Inserisci un Cliente dalla Console

Apri la Console del browser (F12 > Console) e digita:

```javascript
// Test INSERT
const test = await SupabaseStorage.saveCliente({
    nome: 'Test Cliente',
    email: 'test@email.com',
    telefono: '123456789'
});

console.log('Cliente creato:', test);
```

Dovresti vedere il log con i dati del cliente creato, incluso ID e codice.

### Test 3: Leggi i Clienti

```javascript
// Test READ
const clienti = await SupabaseStorage.getClienti();
console.log('Clienti nel database:', clienti);
```

### Test 4: Verifica su Supabase Dashboard

1. Vai su [Table Editor](https://supabase.com/dashboard/project/lkjkuqizpauustexolcu/editor)
2. Clicca sulla tabella `clienti`
3. Dovresti vedere i record inseriti

---

## 🔧 METODI DISPONIBILI

### Per ogni entità (Clienti, Fornitori, Prodotti, etc.):

| Metodo | Descrizione | Esempio |
|--------|-------------|---------|
| `getAll()` | Recupera tutti i record | `await SupabaseStorage.getClienti()` |
| `getById(id)` | Recupera un record per ID | `await SupabaseStorage.getCliente(id)` |
| `save(item)` | Inserisce o aggiorna | `await SupabaseStorage.saveCliente(cliente)` |
| `delete(id)` | Elimina un record | `await SupabaseStorage.deleteCliente(id)` |
| `search(query)` | Cerca nei campi principali | `await SupabaseStorage.searchClienti('Mario')` |

### Metodi Utilità:

```javascript
// Conta record
const num = await SupabaseStorage.count('clienti');

// Verifica esistenza
const esiste = await SupabaseStorage.exists('clienti', 'email', 'test@email.com');

// Genera codice progressivo
const codice = await SupabaseStorage.generateCodice('clienti'); // CLI001, CLI002, etc.
```

---

## ❓ FAQ

### Q: Devo cambiare tutti i file JavaScript subito?

**R:** No, puoi fare una migrazione graduale. I file che non modifichi continueranno a usare localStorage. Ma per sfruttare Supabase, dovrai aggiornare almeno i file delle pagine principali che usi.

### Q: Posso usare sia localStorage che Supabase insieme?

**R:** Sì, tecnicamente sì. Puoi usare localStorage come cache locale e Supabase come database principale. Ma è consigliato usare solo Supabase per evitare confusione.

### Q: Cosa succede se perdo la connessione internet?

**R:** Le operazioni Supabase falliranno e riceverai `null` o array vuoto `[]`. È importante gestire questi casi nel codice con controlli.

### Q: Come posso vedere i miei dati?

**R:** Vai su [Supabase Dashboard > Table Editor](https://supabase.com/dashboard/project/lkjkuqizpauustexolcu/editor) per visualizzare e modificare i dati direttamente.

### Q: Le chiavi API sono sicure?

**R:** La chiave "anon public" che usi è progettata per essere pubblica. Le Row Level Security (RLS) policies proteggono i dati. Per ora abbiamo impostato accesso completo per semplicità, ma in produzione dovrai configurare policy più restrittive.

### Q: Posso importare i dati da localStorage?

**R:** Sì! Ecco un esempio:

```javascript
async function importaDaLocalStorage() {
    // Prendi dati vecchi
    const clientiVecchi = JSON.parse(localStorage.getItem('gestionale_clienti')) || [];
    
    // Importa in Supabase
    for (const cliente of clientiVecchi) {
        // Rimuovi l'id vecchio (Supabase ne genererà uno nuovo)
        delete cliente.id;
        
        await SupabaseStorage.saveCliente(cliente);
    }
    
    console.log(`✅ Importati ${clientiVecchi.length} clienti`);
}

// Esegui nella console
await importaDaLocalStorage();
```

---

## 🎉 CONCLUSIONE

Ora hai tutto il necessario per migrare il tuo gestionale a Supabase!

**Ricorda:**
1. ✅ Tutte le funzioni devono essere `async`
2. ✅ Usa sempre `await` con SupabaseStorage
3. ✅ Gestisci gli errori con try-catch
4. ✅ Controlla sempre i risultati prima di usarli

**Prossimi passi:**
- Esegui lo script SQL su Supabase
- Testa la connessione aprendo index.html
- Inizia a modificare i tuoi file JavaScript uno alla volta
- Testa ogni modifica prima di procedere

Buon lavoro! 🚀
