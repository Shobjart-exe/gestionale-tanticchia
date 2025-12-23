/**
 * GESTIONE CLIENTI DETTAGLIO - OFFLINE
 */

// 1. Inizializzazione DB
const DB = {
    clienti: JSON.parse(localStorage.getItem('gestionale_clienti')) || []
};

// Variabile per gestire la modalità Modifica
let currentClienteId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // Controlla se siamo in modalità modifica (c'è ?id=... nell'URL)
    const urlParams = new URLSearchParams(window.location.search);
    currentClienteId = urlParams.get('id');

    if (currentClienteId) {
        caricaDatiCliente(currentClienteId);
    }

    // Gestione salvataggio
    document.getElementById('form-cliente').addEventListener('submit', salvaCliente);
});

// 2. Carica dati se siamo in modifica
function caricaDatiCliente(id) {
    const cliente = DB.clienti.find(c => c.id === id);
    
    if (!cliente) {
        alert("Cliente non trovato!");
        return;
    }

    // Aggiorna UI
    document.getElementById('id-display').textContent = 'MODIFICA: ' + cliente.codice;
    document.getElementById('id-display').className = 'tag is-warning is-light';

    // Popola campi (Safety check: se il campo non esiste nel DB, mette stringa vuota)
    document.getElementById('nome').value = cliente.nome || '';
    document.getElementById('tipologia').value = cliente.tipologia || 'Privato';
    document.getElementById('codice_fiscale').value = cliente.codice_fiscale || '';
    document.getElementById('partita_iva').value = cliente.partita_iva || '';
    
    document.getElementById('indirizzo').value = cliente.indirizzo || '';
    document.getElementById('cap').value = cliente.cap || '';
    document.getElementById('citta').value = cliente.citta || '';
    document.getElementById('provincia').value = cliente.provincia || '';
    
    document.getElementById('telefono').value = cliente.telefono || '';
    document.getElementById('cellulare').value = cliente.cellulare || '';
    document.getElementById('email').value = cliente.email || '';
    document.getElementById('note').value = cliente.note || '';
}

// 3. Salva Cliente (Create or Update)
function salvaCliente(e) {
    e.preventDefault();

    // Raccogli i dati dal form
    const formData = {
        nome: document.getElementById('nome').value.trim(),
        tipologia: document.getElementById('tipologia').value,
        codice_fiscale: document.getElementById('codice_fiscale').value.trim(),
        partita_iva: document.getElementById('partita_iva').value.trim(),
        indirizzo: document.getElementById('indirizzo').value.trim(),
        cap: document.getElementById('cap').value.trim(),
        citta: document.getElementById('citta').value.trim(),
        provincia: document.getElementById('provincia').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        cellulare: document.getElementById('cellulare').value.trim(),
        email: document.getElementById('email').value.trim(),
        note: document.getElementById('note').value.trim(),
        updated_at: new Date().toISOString()
    };

    if (currentClienteId) {
        // --- UPDATE ---
        const index = DB.clienti.findIndex(c => c.id === currentClienteId);
        if (index !== -1) {
            // Manteniamo ID, Codice e data creazione originali
            DB.clienti[index] = { 
                ...DB.clienti[index], 
                ...formData 
            };
            alert('Cliente modificato con successo!');
        }
    } else {
        // --- CREATE ---
        const newId = 'CLI-' + Date.now();
        // Generiamo un codice leggibile progressivo fittizio (es. C-001) o usiamo l'ID
        const codiceLeggibile = 'C-' + (DB.clienti.length + 1).toString().padStart(3, '0');

        const newCliente = {
            id: newId,
            codice: codiceLeggibile,
            created_at: new Date().toISOString(),
            ...formData
        };

        DB.clienti.push(newCliente);
        alert('Nuovo cliente creato!');
    }

    // Persistenza
    localStorage.setItem('gestionale_clienti', JSON.stringify(DB.clienti));
    
    // Torna alla lista (o ricarica)
    // window.location.href = '../clienti.html';
    history.back(); // Torna indietro comodamente
}