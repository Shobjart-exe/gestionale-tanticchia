/**
 * GESTIONE FORNITORI DETTAGLIO - OFFLINE
 */

// 1. Caricamento Dati (Fornitori E Ordini per lo storico)
const DB = {
    fornitori: JSON.parse(localStorage.getItem('gestionale_fornitori')) || [],
    ordini_in: JSON.parse(localStorage.getItem('gestionale_ordini_in')) || []
};

let currentFornitoreId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // Controlla URL per ID
    const urlParams = new URLSearchParams(window.location.search);
    currentFornitoreId = urlParams.get('id');

    if (currentFornitoreId) {
        caricaDatiFornitore(currentFornitoreId);
        caricaStoricoOrdini(currentFornitoreId);
    }

    // Listener salvataggio
    document.getElementById('form-fornitore').addEventListener('submit', salvaFornitore);
});

// 2. Carica Dati nel Form
function caricaDatiFornitore(id) {
    const fornitore = DB.fornitori.find(f => f.id === id);
    
    if (!fornitore) {
        alert("Fornitore non trovato!");
        return;
    }

    // Aggiorna Badge ID
    document.getElementById('id-display').textContent = 'MODIFICA: ' + (fornitore.codice || '---');
    
    // Mostra sezione storico
    document.getElementById('section-storico').classList.remove('is-hidden');

    // Popola campi (con valori di default vuoti per evitare undefined)
    document.getElementById('nome').value = fornitore.nome || '';
    document.getElementById('partita_iva').value = fornitore.partita_iva || '';
    document.getElementById('codice_fiscale').value = fornitore.codice_fiscale || '';
    document.getElementById('iban').value = fornitore.iban || '';
    
    document.getElementById('indirizzo').value = fornitore.indirizzo || '';
    document.getElementById('cap').value = fornitore.cap || '';
    document.getElementById('citta').value = fornitore.citta || '';
    document.getElementById('provincia').value = fornitore.provincia || '';
    
    document.getElementById('email').value = fornitore.email || '';
    document.getElementById('telefono').value = fornitore.telefono || '';
    document.getElementById('sito_web').value = fornitore.sito_web || '';
    document.getElementById('note').value = fornitore.note || '';
}

// 3. Carica Storico Ordini (Legge da Ordini IN)
function caricaStoricoOrdini(idFornitore) {
    const tbody = document.getElementById('tabella-storico');
    const msgEmpty = document.getElementById('storico-empty-msg');
    
    // Filtra ordini di questo fornitore
    const ordiniFornitore = DB.ordini_in.filter(o => o.fornitore_id === idFornitore);
    
    // Ordina per data decrescente (dal più recente)
    ordiniFornitore.sort((a, b) => new Date(b.data) - new Date(a.data));

    if (ordiniFornitore.length > 0) {
        msgEmpty.style.display = 'none';
        
        ordiniFornitore.forEach(ordine => {
            const tr = document.createElement('tr');
            
            // Badge stato colorato
            let badgeClass = 'is-light';
            if (ordine.stato === 'evaso') badgeClass = 'is-success is-light';
            if (ordine.stato === 'attesa') badgeClass = 'is-warning is-light';
            if (ordine.stato === 'annullato') badgeClass = 'is-danger is-light';

            tr.innerHTML = `
                <td>${ordine.data}</td>
                <td class="is-family-monospace has-text-weight-bold">${ordine.id.split('-').pop()}</td>
                <td><span class="tag ${badgeClass}">${ordine.stato.toUpperCase()}</span></td>
                <td class="has-text-right has-text-weight-bold">€ ${parseFloat(ordine.totale).toFixed(2)}</td>
                <td class="has-text-right">
                    <a href="../../ordini/in/dettaglio.html?id=${ordine.id}" class="button is-small is-info is-outlined">
                        <i class="fas fa-eye"></i>
                    </a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        msgEmpty.style.display = 'block';
    }
}

// 4. Salva Fornitore
function salvaFornitore(e) {
    e.preventDefault();

    const formData = {
        nome: document.getElementById('nome').value.trim(),
        partita_iva: document.getElementById('partita_iva').value.trim(),
        codice_fiscale: document.getElementById('codice_fiscale').value.trim(),
        iban: document.getElementById('iban').value.trim(),
        indirizzo: document.getElementById('indirizzo').value.trim(),
        cap: document.getElementById('cap').value.trim(),
        citta: document.getElementById('citta').value.trim(),
        provincia: document.getElementById('provincia').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        sito_web: document.getElementById('sito_web').value.trim(),
        note: document.getElementById('note').value.trim(),
        updated_at: new Date().toISOString()
    };

    if (currentFornitoreId) {
        // --- UPDATE ---
        const index = DB.fornitori.findIndex(f => f.id === currentFornitoreId);
        if (index !== -1) {
            DB.fornitori[index] = { ...DB.fornitori[index], ...formData };
            alert('Fornitore aggiornato!');
        }
    } else {
        // --- CREATE ---
        const newId = 'FOR-' + Date.now();
        const codiceLeggibile = 'F-' + (DB.fornitori.length + 1).toString().padStart(3, '0');

        const newFornitore = {
            id: newId,
            codice: codiceLeggibile,
            created_at: new Date().toISOString(),
            ...formData
        };

        DB.fornitori.push(newFornitore);
        alert('Nuovo fornitore creato!');
    }

    localStorage.setItem('gestionale_fornitori', JSON.stringify(DB.fornitori));
    history.back();
}