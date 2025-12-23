/**
 * GESTIONE ORDINI FORNITORI (IN) - OFFLINE
 */

// 1. Inizializzazione DB Fake (Mock Data)
const DB = {
    fornitori: JSON.parse(localStorage.getItem('gestionale_fornitori')) || [],
    materie_prime: JSON.parse(localStorage.getItem('gestionale_materie_prime')) || [],
    ordini_in: JSON.parse(localStorage.getItem('gestionale_ordini_in')) || []
};

// Se vuoti, crea dati di prova per permetterti di testare subito
if (DB.fornitori.length === 0) {
    DB.fornitori = [
        { id: 'for_1', nome: 'Tessuti Italiani Spa' },
        { id: 'for_2', nome: 'Merceria Il Bottone' },
        { id: 'for_3', nome: 'Ingrosso Filati' }
    ];
    localStorage.setItem('gestionale_fornitori', JSON.stringify(DB.fornitori));
}

if (DB.materie_prime.length === 0) {
    DB.materie_prime = [
        { id: 'mat_1', nome: 'Seta Rossa', unita: 'mt', costo: 12.50 },
        { id: 'mat_2', nome: 'Bottoni Dorati', unita: 'pz', costo: 0.50 },
        { id: 'mat_3', nome: 'Filo Cotone Nero', unita: 'rocca', costo: 3.00 },
        { id: 'mat_4', nome: 'Cerniera Lampo 20cm', unita: 'pz', costo: 1.20 }
    ];
    localStorage.setItem('gestionale_materie_prime', JSON.stringify(DB.materie_prime));
}

// 2. Setup Pagina
document.addEventListener('DOMContentLoaded', () => {
    impostaDataOdierna();
    popolaSelectFornitori();
    aggiungiRiga(); // Una riga vuota di default
    
    document.getElementById('form-ordine-in').addEventListener('submit', salvaOrdineFornitore);
});

// Popola la select dei fornitori
function popolaSelectFornitori() {
    const select = document.getElementById('fornitore_select');
    DB.fornitori.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = f.nome;
        select.appendChild(option);
    });
}

function impostaDataOdierna() {
    document.getElementById('data_ordine').value = new Date().toISOString().split('T')[0];
}

// 3. Logica Tabella Dinamica
window.aggiungiRiga = function() {
    const tbody = document.getElementById('tabella_righe');
    const tr = document.createElement('tr');

    // Costruiamo le option con Nome + Unità di Misura
    const optionsMaterie = DB.materie_prime.map(m => 
        `<option value="${m.id}" data-costo="${m.costo}">${m.nome} (${m.unita})</option>`
    ).join('');

    tr.innerHTML = `
        <td>
            <div class="select is-fullwidth">
                <select class="select-materia" onchange="aggiornaCosto(this)" required>
                    <option value="">Seleziona materiale...</option>
                    ${optionsMaterie}
                </select>
            </div>
        </td>
        <td>
            <input type="number" step="0.01" class="input input-costo" value="0.00" oninput="calcolaTotali()">
        </td>
        <td>
            <input type="number" step="0.01" class="input input-qty" value="1" min="0.1" oninput="calcolaTotali()">
        </td>
        <td>
            <input type="text" class="input input-totale-riga" value="0.00" readonly>
        </td>
        <td class="has-text-centered">
            <button type="button" class="button is-danger is-small is-inverted" onclick="rimuoviRiga(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(tr);
};

window.rimuoviRiga = function(btn) {
    btn.closest('tr').remove();
    calcolaTotali();
};

// Quando selezioni una materia, compila il costo di acquisto default
window.aggiornaCosto = function(select) {
    const tr = select.closest('tr');
    const costo = select.options[select.selectedIndex].dataset.costo || 0;
    tr.querySelector('.input-costo').value = costo;
    calcolaTotali();
};

window.calcolaTotali = function() {
    let totaleMerce = 0;
    const righe = document.querySelectorAll('#tabella_righe tr');

    righe.forEach(riga => {
        const costo = parseFloat(riga.querySelector('.input-costo').value) || 0;
        const qty = parseFloat(riga.querySelector('.input-qty').value) || 0;
        const totaleRiga = costo * qty;

        riga.querySelector('.input-totale-riga').value = totaleRiga.toFixed(2);
        totaleMerce += totaleRiga;
    });

    const spedizione = parseFloat(document.getElementById('costo_spedizione').value) || 0;
    const totaleFinale = totaleMerce + spedizione;

    document.getElementById('totale_display').textContent = `€ ${totaleFinale.toFixed(2)}`;
    return totaleFinale;
};

// 4. Salvataggio
function salvaOrdineFornitore(e) {
    e.preventDefault();

    const selectFornitore = document.getElementById('fornitore_select');

    // Oggetto Ordine
    const nuovoOrdine = {
        id: 'ORD-IN-' + Date.now(),
        fornitore_id: selectFornitore.value,
        fornitore_nome: selectFornitore.options[selectFornitore.selectedIndex].text,
        data: document.getElementById('data_ordine').value,
        metodo_pagamento: document.getElementById('metodo_pagamento').value,
        stato: document.getElementById('stato_ordine').value,
        costo_spedizione: parseFloat(document.getElementById('costo_spedizione').value) || 0,
        articoli: [],
        totale: window.calcolaTotali()
    };

    // Raccogli articoli
    document.querySelectorAll('#tabella_righe tr').forEach(riga => {
        const selectMat = riga.querySelector('.select-materia');
        if(selectMat.value) {
            nuovoOrdine.articoli.push({
                materia_id: selectMat.value,
                materia_nome: selectMat.options[selectMat.selectedIndex].text,
                costo_acquisto: parseFloat(riga.querySelector('.input-costo').value),
                quantita: parseFloat(riga.querySelector('.input-qty').value)
            });
        }
    });

    if(nuovoOrdine.articoli.length === 0) {
        alert("Inserisci almeno una materia prima!");
        return;
    }

    // Salva in LocalStorage
    DB.ordini_in.push(nuovoOrdine);
    localStorage.setItem('gestionale_ordini_in', JSON.stringify(DB.ordini_in));

    alert('Ordine Fornitore registrato!');
    // Redirect alla lista (quando la creerai) o reset form
    // window.location.href = '../index.html'; 
    location.reload(); 
}