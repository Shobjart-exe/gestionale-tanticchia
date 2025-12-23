// clienti.js - Gestione dinamica lista clienti

const ClientiPage = {
    clienti: [],
    filteredClienti: [],

    init() {
        this.loadClienti();
        this.renderTable();
        this.setupEventListeners();
    },

    loadClienti() {
        this.clienti = Storage.getClienti();
        this.filteredClienti = [...this.clienti];
    },

    renderTable() {
        const tbody = document.querySelector('#clientiTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredClienti.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="has-text-centered has-text-grey">
                        Nessun cliente trovato
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredClienti.forEach(cliente => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => this.navigateToDetail(cliente.id);
            
            row.innerHTML = `
                <td><strong>${Utils.escapeHtml(cliente.codice)}</strong></td>
                <td>${Utils.escapeHtml(cliente.ragioneSociale)}</td>
                <td>${Utils.escapeHtml(cliente.piva || '')}</td>
                <td>${Utils.escapeHtml(cliente.citta || '')}</td>
                <td>${Utils.escapeHtml(cliente.telefono || '')}</td>
                <td>${Utils.escapeHtml(cliente.email || '')}</td>
                <td><span class="tag is-${this.getStatoClass(cliente.stato)}">${Utils.escapeHtml(cliente.stato || 'Attivo')}</span></td>
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
        // Search input
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Nuovo Cliente button
        const nuovoBtn = document.querySelector('#nuovoClienteBtn');
        if (nuovoBtn) {
            nuovoBtn.onclick = () => this.navigateToCreate();
        }
    },

    handleSearch(query) {
        if (!query) {
            this.filteredClienti = [...this.clienti];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredClienti = this.clienti.filter(cliente => 
                cliente.ragioneSociale.toLowerCase().includes(lowerQuery) ||
                cliente.codice.toLowerCase().includes(lowerQuery) ||
                (cliente.piva && cliente.piva.toLowerCase().includes(lowerQuery)) ||
                (cliente.email && cliente.email.toLowerCase().includes(lowerQuery))
            );
        }
        this.renderTable();
    },

    updateStats() {
        const totalEl = document.querySelector('#totalClienti');
        if (totalEl) {
            totalEl.textContent = this.clienti.length;
        }
    },

    navigateToDetail(id) {
        Utils.navigate('clienti/dettaglio.html', { id });
    },

    navigateToCreate() {
        Utils.navigate('clienti/dettaglio.html', { mode: 'create' });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ClientiPage.init();
});
