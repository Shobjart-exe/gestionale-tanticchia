// fornitori.js - Gestione dinamica lista fornitori

const FornitoriPage = {
    fornitori: [],
    filteredFornitori: [],

    init() {
        this.loadFornitori();
        this.renderTable();
        this.setupEventListeners();
    },

    loadFornitori() {
        this.fornitori = Storage.getFornitori();
        this.filteredFornitori = [...this.fornitori];
    },

    renderTable() {
        const tbody = document.querySelector('#fornitoriTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredFornitori.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="has-text-centered has-text-grey">
                        Nessun fornitore trovato
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredFornitori.forEach(fornitore => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => this.navigateToDetail(fornitore.id);
            
            row.innerHTML = `
                <td><strong>${Utils.escapeHtml(fornitore.codice)}</strong></td>
                <td>${Utils.escapeHtml(fornitore.ragioneSociale)}</td>
                <td>${Utils.escapeHtml(fornitore.piva || '')}</td>
                <td><span class="tag is-info">${Utils.escapeHtml(fornitore.categoria || 'Generico')}</span></td>
                <td>${Utils.escapeHtml(fornitore.citta || '')}</td>
                <td>${Utils.escapeHtml(fornitore.telefono || '')}</td>
                <td><span class="tag is-${this.getStatoClass(fornitore.stato)}">${Utils.escapeHtml(fornitore.stato || 'Attivo')}</span></td>
            `;
            
            tbody.appendChild(row);
        });

        this.updateStats();
    },

    getStatoClass(stato) {
        const classes = {
            'Attivo': 'success',
            'Sospeso': 'warning',
            'Inattivo': 'danger'
        };
        return classes[stato] || 'info';
    },

    setupEventListeners() {
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        const nuovoBtn = document.querySelector('#nuovoFornitoreBtn');
        if (nuovoBtn) {
            nuovoBtn.onclick = () => this.navigateToCreate();
        }
    },

    handleSearch(query) {
        if (!query) {
            this.filteredFornitori = [...this.fornitori];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredFornitori = this.fornitori.filter(fornitore => 
                fornitore.ragioneSociale.toLowerCase().includes(lowerQuery) ||
                fornitore.codice.toLowerCase().includes(lowerQuery) ||
                (fornitore.piva && fornitore.piva.toLowerCase().includes(lowerQuery)) ||
                (fornitore.categoria && fornitore.categoria.toLowerCase().includes(lowerQuery))
            );
        }
        this.renderTable();
    },

    updateStats() {
        const totalEl = document.querySelector('#totalFornitori');
        if (totalEl) {
            totalEl.textContent = this.fornitori.length;
        }
    },

    navigateToDetail(id) {
        Utils.navigate('fornitori/dettaglio.html', { id });
    },

    navigateToCreate() {
        Utils.navigate('fornitori/dettaglio.html', { mode: 'create' });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    FornitoriPage.init();
});
