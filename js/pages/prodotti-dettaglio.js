/**
 * GESTIONE CRUD PRODOTTI (OFFLINE)
 */

// 1. Carichiamo i dati necessari
const DB = {
    prodotti: JSON.parse(localStorage.getItem('gestionale_prodotti')) || [],
    materie: JSON.parse(localStorage.getItem('gestionale_materie_prime')) || []
};

// Variabile per memorizzare la lista "ingredienti" temporanea
let ricettaCorrente = []; 
let currentId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // Popola la tendina delle materie prime disponibili
    popolaSelectMaterie();

    // Controlla se siamo in modifica (c'è ?id=... nell'URL)
    const urlParams = new URLSearchParams(window.location.search);
    currentId = urlParams.get('id');

    if (currentId) {
        caricaDatiProdotto(currentId);
    }

    // Gestione salvataggio
    document.getElementById('form-prodotto').addEventListener('submit', salvaProdotto);
});

// Funzione per riempire la select
function popolaSelectMaterie() {
    const select = document.getElementById('select_materia');
    DB.materie.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        // Mostra nome e unità di misura (es. Seta Rossa - mt)
        option.textContent = `${m.nome} (${m.unita_misura})`; 
        // Salviamo il costo come attributo per usarlo nei calcoli
        option.dataset.costo = m.costo_acquisto; 
        select.appendChild(option);
    });
}

// Funzione per aggiungere riga alla ricetta
window.aggiungiMateriale = function() {
    const select = document.getElementById('select_materia');
    const inputQty = document.getElementById('qty_materia');
    
    const idMateria = select.value;
    const qty = parseFloat(inputQty.value);

    if (!idMateria || !qty) {
        alert("Seleziona materiale e quantità!");
        return;
    }

    const materiaDati = DB.materie.find(m => m.id === idMateria);

    // Aggiungi all'array
    ricettaCorrente.push({
        materia_id: idMateria,
        nome: materiaDati.nome,
        unita: materiaDati.unita_misura,
        costo_unitario: parseFloat(materiaDati.costo_acquisto),
        quantita: qty
    });

    // Pulisci input
    select.value = "";
    inputQty.value = "";

    renderRicetta();
};

// Funzione per rimuovere riga
window.rimuoviMateriale = function(index) {
    ricettaCorrente.splice(index, 1);
    renderRicetta();
};

// Disegna la tabella ricetta e calcola il totale Costo Produzione
function renderRicetta() {
    const tbody = document.getElementById('tabella_ricetta');
    tbody.innerHTML = '';
    let costoTotale = 0;

    if (ricettaCorrente.length > 0) {
        document.getElementById('msg-vuoto').style.display = 'none';
        
        ricettaCorrente.forEach((item, index) => {
            const costoRiga = item.costo_unitario * item.quantita;
            costoTotale += costoRiga;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nome}</td>
                <td>${item.quantita} ${item.unita}</td>
                <td>€ ${costoRiga.toFixed(2)}</td>
                <td class="has-text-right">
                    <button type="button" class="delete" onclick="rimuoviMateriale(${index})"></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        document.getElementById('msg-vuoto').style.display = 'block';
    }

    // Aggiorna il campo Costo Produzione
    document.getElementById('costo_produzione').value = costoTotale.toFixed(2);
}

// Carica dati se siamo in modifica
function caricaDatiProdotto(id) {
    const prod = DB.prodotti.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('nome').value = prod.nome;
    document.getElementById('colore_hex').value = prod.colore_hex || '#000000';
    document.getElementById('colore_nome').value = prod.colore_nome || '';
    document.getElementById('quantita').value = prod.quantita;
    document.getElementById('prezzo_vendita').value = prod.prezzo_vendita;
    
    // Carica ricetta
    ricettaCorrente = prod.ricetta || [];
    renderRicetta();
}

// Salvataggio finale
function salvaProdotto(e) {
    e.preventDefault();

    const formData = {
        nome: document.getElementById('nome').value,
        colore_hex: document.getElementById('colore_hex').value,
        colore_nome: document.getElementById('colore_nome').value,
        quantita: parseInt(document.getElementById('quantita').value) || 0,
        prezzo_vendita: parseFloat(document.getElementById('prezzo_vendita').value) || 0,
        costo_produzione: parseFloat(document.getElementById('costo_produzione').value) || 0,
        ricetta: ricettaCorrente, // Array degli ingredienti
        updated_at: new Date().toISOString()
    };

    if (currentId) {
        // Modifica esistente
        const index = DB.prodotti.findIndex(p => p.id === currentId);
        DB.prodotti[index] = { ...DB.prodotti[index], ...formData };
    } else {
        // Crea nuovo
        formData.id = 'PROD-' + Date.now();
        formData.created_at = new Date().toISOString();
        DB.prodotti.push(formData);
    }

    localStorage.setItem('gestionale_prodotti', JSON.stringify(DB.prodotti));
    
    alert("Prodotto salvato!");
    history.back(); // Torna alla lista
}