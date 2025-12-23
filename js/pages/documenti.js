// documenti.js - Gestione lista documenti

const DocumentiPage = {
    documenti: [],
    filteredDocumenti: [],

    init() {
        this.loadDocumenti();
        this.renderTable();
        this.setupEventListeners();
        this.updateStats();
    },

    loadDocumenti() {
        this.documenti = Storage.getDocumenti();
        this.filteredDocumenti = [...this.documenti];
    },

    renderTable() {
        const tbody = document.querySelector('#documentiTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredDocumenti.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="has-text-centered has-text-grey">
                        Nessun documento trovato
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredDocumenti.forEach(doc => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => this.navigateToDetail(doc.id);
            
            const statoClass = this.getStatoClass(doc.stato);
            
            row.innerHTML = `
                <td><strong>${Utils.escapeHtml(doc.codice)}</strong></td>
                <td><span class="tag is-info is-light">${Utils.escapeHtml(doc.tipo)}</span></td>
                <td>${Utils.formatDate(doc.data)}</td>
                <td>${Utils.escapeHtml(doc.controparte)}</td>
                <td>${Utils.formatCurrency(doc.importo || 0)}</td>
                <td><span class="status-badge ${statoClass}">${Utils.escapeHtml(doc.stato)}</span></td>
            `;
            
            tbody.appendChild(row);
        });
    },

    getStatoClass(stato) {
        switch(stato?.toLowerCase()) {
            case 'pagata': return 'is-completed';
            case 'emessa': return 'is-completed';
            case 'in attesa': return 'is-pending';
            case 'bozza': return 'is-pending';
            default: return '';
        }
    },

    setupEventListeners() {
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        const nuovoBtn = document.querySelector('#nuovoDocumentoBtn');
        if (nuovoBtn) {
            nuovoBtn.onclick = () => this.navigateToCreate();
        }
    },

    handleSearch(query) {
        if (!query) {
            this.filteredDocumenti = [...this.documenti];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredDocumenti = this.documenti.filter(doc => 
                doc.codice.toLowerCase().includes(lowerQuery) ||
                doc.controparte.toLowerCase().includes(lowerQuery) ||
                doc.tipo.toLowerCase().includes(lowerQuery)
            );
        }
        this.renderTable();
    },

    updateStats() {
        // Aggiorna statistiche se presenti nel DOM
        const fattureMese = this.documenti.filter(d => d.tipo === 'Fattura').length;
        const valoreFatture = this.documenti
            .filter(d => d.tipo === 'Fattura')
            .reduce((sum, d) => sum + (d.importo || 0), 0);

        const fattureEl = document.querySelector('#fattureMese');
        if (fattureEl) fattureEl.textContent = fattureMese;
        
        const valoreEl = document.querySelector('#valoreFatture');
        if (valoreEl) valoreEl.textContent = `per ${Utils.formatCurrency(valoreFatture)}`;
    },

    navigateToDetail(id) {
        window.location.href = `documenti/dettaglio.html?id=${id}`;
    },

    navigateToCreate() {
        window.location.href = 'documenti/dettaglio.html?mode=create';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DocumentiPage.init();
});
