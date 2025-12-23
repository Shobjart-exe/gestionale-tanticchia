// materie-prime.js - Gestione dinamica lista materie prime

const MateriePrimePage = {
    materiePrime: [],
    filteredMateriePrime: [],

    init() {
        this.loadMateriePrime();
        this.renderTable();
        this.setupEventListeners();
        this.updateStats();
    },

    loadMateriePrime() {
        this.materiePrime = Storage.getMateriePrime();
        this.filteredMateriePrime = [...this.materiePrime];
    },

    renderTable() {
        const tbody = document.querySelector('#materiePrimeTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredMateriePrime.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="has-text-centered has-text-grey">
                        Nessuna materia prima trovata
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredMateriePrime.forEach(mp => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => this.navigateToDetail(mp.id);
            
            const giacenzaLibera = (mp.giacenzaTotale || 0) - (mp.giacenzaPrenotata || 0);
            const statoGiacenza = this.getStatoGiacenza(giacenzaLibera, mp.scortaMinima || 100);
            
            row.innerHTML = `
                <td><strong>${Utils.escapeHtml(mp.codice)}</strong></td>
                <td>${Utils.escapeHtml(mp.nome)}</td>
                <td><span class="tag is-info">${Utils.escapeHtml(mp.categoria || 'N/A')}</span></td>
                <td>${Utils.escapeHtml(mp.unitaMisura || '-')}</td>
                <td>${Utils.formatCurrency(mp.costoUnitario || 0)}</td>
                <td><span class="tag is-${statoGiacenza.class}">${giacenzaLibera}</span></td>
                <td>${mp.giacenzaTotale || 0}</td>
            `;
            
            tbody.appendChild(row);
        });
    },

    getStatoGiacenza(giacenza, scortaMinima) {
        if (giacenza === 0) {
            return { class: 'danger', text: 'Esaurito' };
        } else if (giacenza <= scortaMinima) {
            return { class: 'warning', text: 'Scorta bassa' };
        } else {
            return { class: 'success', text: 'Disponibile' };
        }
    },

    setupEventListeners() {
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        const categoriaFilter = document.querySelector('#categoriaFilter');
        if (categoriaFilter) {
            categoriaFilter.addEventListener('change', (e) => {
                this.handleFilter(e.target.value);
            });
        }

        const nuovoBtn = document.querySelector('#nuovaMateriaPrimaBtn');
        if (nuovoBtn) {
            nuovoBtn.onclick = () => this.navigateToCreate();
        }
    },

    handleSearch(query) {
        if (!query) {
            this.filteredMateriePrime = [...this.materiePrime];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredMateriePrime = this.materiePrime.filter(mp => 
                mp.nome.toLowerCase().includes(lowerQuery) ||
                mp.codice.toLowerCase().includes(lowerQuery) ||
                (mp.categoria && mp.categoria.toLowerCase().includes(lowerQuery))
            );
        }
        this.renderTable();
    },

    handleFilter(categoria) {
        if (!categoria || categoria === 'tutti') {
            this.filteredMateriePrime = [...this.materiePrime];
        } else {
            this.filteredMateriePrime = this.materiePrime.filter(mp => mp.categoria === categoria);
        }
        this.renderTable();
    },

    updateStats() {
        const totalEl = document.querySelector('#totalMateriePrime');
        if (totalEl) {
            totalEl.textContent = this.materiePrime.length;
        }

        const valoreMagazzinoEl = document.querySelector('#valoreMagazzino');
        if (valoreMagazzinoEl) {
            const valore = this.materiePrime.reduce((sum, mp) => {
                return sum + ((mp.giacenzaTotale || 0) * (mp.costoUnitario || 0));
            }, 0);
            valoreMagazzinoEl.textContent = Utils.formatCurrency(valore);
        }

        const scorteBasse = this.materiePrime.filter(mp => {
            const libera = (mp.giacenzaTotale || 0) - (mp.giacenzaPrenotata || 0);
            return libera <= (mp.scortaMinima || 100) && libera > 0;
        }).length;

        const scorteBasseEl = document.querySelector('#scorteBasse');
        if (scorteBasseEl) {
            scorteBasseEl.textContent = scorteBasse;
        }
    },

    navigateToDetail(id) {
        window.location.href = `materie-prime/dettaglio.html?id=${id}`;
    },

    navigateToCreate() {
        window.location.href = 'materie-prime/dettaglio.html?mode=create';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MateriePrimePage.init();
});
