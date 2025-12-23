/**
 * GESTIONE MATERIE PRIME - OFFLINE
 */

const DB = {
    materie: JSON.parse(localStorage.getItem('gestionale_materie_prime')) || [],
    fornitori: JSON.parse(localStorage.getItem('gestionale_fornitori')) || []
};

let currentId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // Popola select fornitori
    const selectFornitore = document.getElementById('fornitore_id');
    DB.fornitori.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = f.nome;
        selectFornitore.appendChild(option);
    });

    // Check modalità Modifica
    const urlParams = new URLSearchParams(window.location.search);
    currentId = urlParams.get('id');

    if (currentId) {
        caricaDati(currentId);
    } else {
        // Genera un codice casuale se è nuovo
        document.getElementById('codice').value = 'MAT-' + Math.floor(1000 + Math.random() * 9000);
    }

    document.getElementById('form-materia').addEventListener('submit', salvaMateria);
});

function caricaDati(id) {
    const materia = DB.materie.find(m => m.id === id);
    
    if (!materia) {
        alert("Materiale non trovato!");
        return;
    }

    // Aggiorna Badge
    const badge = document.getElementById('stock-status');
    badge.textContent = `Giacenza: ${materia.quantita_disponibile} ${materia.unita_misura}`;
    
    // Colora il badge in base alla scorta
    if (parseFloat(materia.quantita_disponibile) <= parseFloat(materia.scorta_minima)) {
        badge.className = 'tag is-medium is-danger'; // Sotto scorta
    } else {
        badge.className = 'tag is-medium is-success'; // Ok
    }

    // Popola campi
    document.getElementById('codice').value = materia.codice || '';
    document.getElementById('nome').value = materia.nome || '';
    document.getElementById('categoria').value = materia.categoria || 'Tessuto';
    
    document.getElementById('colore_hex').value = materia.colore_hex || '#cccccc';
    document.getElementById('colore_nome').value = materia.colore_nome || '';
    document.getElementById('composizione').value = materia.composizione || '';
    
    document.getElementById('unita_misura').value = materia.unita_misura || 'mt';
    document.getElementById('quantita_disponibile').value = materia.quantita_disponibile || 0;
    document.getElementById('scorta_minima').value = materia.scorta_minima || 5;
    document.getElementById('costo_acquisto').value = materia.costo_acquisto || '';
    
    document.getElementById('fornitore_id').value = materia.fornitore_id || '';
    document.getElementById('note').value = materia.note || '';
}

function salvaMateria(e) {
    e.preventDefault();

    const formData = {
        codice: document.getElementById('codice').value.trim(),
        nome: document.getElementById('nome').value.trim(),
        categoria: document.getElementById('categoria').value,
        
        // Caratteristiche
        colore_hex: document.getElementById('colore_hex').value,
        colore_nome: document.getElementById('colore_nome').value.trim(),
        composizione: document.getElementById('composizione').value.trim(),
        
        // Magazzino
        unita_misura: document.getElementById('unita_misura').value,
        quantita_disponibile: parseFloat(document.getElementById('quantita_disponibile').value) || 0,
        scorta_minima: parseFloat(document.getElementById('scorta_minima').value) || 0,
        costo_acquisto: parseFloat(document.getElementById('costo_acquisto').value) || 0,
        
        fornitore_id: document.getElementById('fornitore_id').value,
        note: document.getElementById('note').value.trim(),
        updated_at: new Date().toISOString()
    };

    if (currentId) {
        // UPDATE
        const index = DB.materie.findIndex(m => m.id === currentId);
        if (index !== -1) {
            DB.materie[index] = { ...DB.materie[index], ...formData };
            alert('Scheda materiale aggiornata!');
        }
    } else {
        // CREATE
        const newMateria = {
            id: 'MAT-' + Date.now(),
            created_at: new Date().toISOString(),
            ...formData
        };
        DB.materie.push(newMateria);
        alert('Nuovo materiale inserito in magazzino!');
    }

    localStorage.setItem('gestionale_materie_prime', JSON.stringify(DB.materie));
    history.back();
}