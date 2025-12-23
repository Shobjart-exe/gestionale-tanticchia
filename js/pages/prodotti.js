// prodotti.js - Gestione dinamica lista prodotti

const ProdottiPage = {
    prodotti: [],
    filteredProdotti: [],

    init() {
        this.loadProdotti();
        this.renderTable();
        this.setupEventListeners();
        this.updateStats();
    },

    loadProdotti() {
        this.prodotti = Storage.getProdotti();
        this.filteredProdotti = [...this.prodotti];
    },

    renderTable() {
        const tbody = document.querySelector('#prodottiTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredProdotti.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="has-text-centered has-text-grey">
                        Nessun prodotto trovato
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredProdotti.forEach(prodotto => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => this.navigateToDetail(prodotto.id);
            
            const giacenzaLibera = (prodotto.giacenzaTotale || 0) - (prodotto.giacenzaPrenotata || 0);
            const statoGiacenza = this.getStatoGiacenza(giacenzaLibera, prodotto.scortaMinima || 10);
            
            row.innerHTML = `
                <td><strong>${Utils.escapeHtml(prodotto.codice)}</strong></td>
                <td>${Utils.escapeHtml(prodotto.nome)}</td>
                <td><span class="tag is-info">${Utils.escapeHtml(prodotto.categoria || 'N/A')}</span></td>
                <td>${Utils.escapeHtml(prodotto.taglia || '-')}</td>
                <td>${Utils.escapeHtml(prodotto.colore || '-')}</td>
                <td>${Utils.formatCurrency(prodotto.prezzoVendita || 0)}</td>
                <td><span class="tag is-${statoGiacenza.class}">${giacenzaLibera}</span></td>
                <td>${prodotto.giacenzaTotale || 0}</td>
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

        const nuovoBtn = document.querySelector('#nuovoProdottoBtn');
        if (nuovoBtn) {
            nuovoBtn.onclick = () => this.navigateToCreate();
        }
    },

    handleSearch(query) {
        if (!query) {
            this.filteredProdotti = [...this.prodotti];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredProdotti = this.prodotti.filter(prodotto => 
                prodotto.nome.toLowerCase().includes(lowerQuery) ||
                prodotto.codice.toLowerCase().includes(lowerQuery) ||
                (prodotto.categoria && prodotto.categoria.toLowerCase().includes(lowerQuery)) ||
                (prodotto.colore && prodotto.colore.toLowerCase().includes(lowerQuery))
            );
        }
        this.renderTable();
    },

    handleFilter(categoria) {
        if (!categoria || categoria === 'tutti') {
            this.filteredProdotti = [...this.prodotti];
        } else {
            this.filteredProdotti = this.prodotti.filter(p => p.categoria === categoria);
        }
        this.renderTable();
    },

    updateStats() {
        const totalEl = document.querySelector('#totalProdotti');
        if (totalEl) {
            totalEl.textContent = this.prodotti.length;
        }

        const valoreMagazzinoEl = document.querySelector('#valoreMagazzino');
        if (valoreMagazzinoEl) {
            const valore = this.prodotti.reduce((sum, p) => {
                return sum + ((p.giacenzaTotale || 0) * (p.costoProdu || 0));
            }, 0);
            valoreMagazzinoEl.textContent = Utils.formatCurrency(valore);
        }

        const scorteBasse = this.prodotti.filter(p => {
            const libera = (p.giacenzaTotale || 0) - (p.giacenzaPrenotata || 0);
            return libera <= (p.scortaMinima || 10) && libera > 0;
        }).length;

        const scorteBasseEl = document.querySelector('#scorteBasse');
        if (scorteBasseEl) {
            scorteBasseEl.textContent = scorteBasse;
        }
    },

    navigateToDetail(id) {
        window.location.href = `prodotti/dettaglio.html?id=${id}`;
    },

    navigateToCreate() {
        window.location.href = 'prodotti/dettaglio.html?mode=create';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ProdottiPage.init();
});
