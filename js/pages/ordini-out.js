// ordini-out.js - Lista ordini OUT (attesa/evasi) da localStorage

const OrdiniOutPage = {
  stato: 'attesa',
  ordini: [],
  filtered: [],

  init() {
    const params = Utils.getURLParams();
    this.stato = params.stato || this.detectStatoFromPath();

    if (!params.stato) {
      const url = new URL(window.location.href);
      url.searchParams.set('stato', this.stato);
      window.history.replaceState({}, '', url.toString());
    }

    this.load();
    this.bind();
    this.render();
    this.updateStats();
  },

  detectStatoFromPath() {
    const path = window.location.pathname;
    if (path.includes('/evasi')) return 'evasi';
    return 'attesa';
  },

  load() {
    this.ordini = Storage.getOrdiniOut();
    this.filtered = this.ordini.filter(o => (o.stato || 'attesa') === this.stato);
  },

  bind() {
    const search = document.getElementById('searchInput');
    if (search) {
      search.addEventListener('input', Utils.debounce((e) => {
        this.applySearch(e.target.value);
      }, 250));
    }

    const nuovoBtn = document.getElementById('nuovoOrdineBtn');
    if (nuovoBtn) {
      nuovoBtn.onclick = () => {
        window.location.href = `dettaglio.html?mode=create&tipo=out`;
      };
    }
  },

  applySearch(q) {
    const query = (q || '').trim().toLowerCase();
    const base = this.ordini.filter(o => (o.stato || 'attesa') === this.stato);
    if (!query) {
      this.filtered = base;
    } else {
      this.filtered = base.filter(o => {
        return (
          (o.codice || '').toLowerCase().includes(query) ||
          (o.controparte || '').toLowerCase().includes(query)
        );
      });
    }
    this.render();
    this.updateStats();
  },

  render() {
    const tbody = document.querySelector('#ordiniTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (this.filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="has-text-centered has-text-grey">Nessun ordine</td>
        </tr>
      `;
      return;
    }

    this.filtered.forEach(o => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.onclick = () => {
        window.location.href = `dettaglio.html?id=${encodeURIComponent(o.id)}`;
      };

      tr.innerHTML = `
        <td><strong>${Utils.escapeHtml(o.codice || '')}</strong></td>
        <td>${Utils.escapeHtml(Utils.formatDate(o.dataOrdine) || '')}</td>
        <td>${Utils.escapeHtml(o.controparte || '')}</td>
        <td class="has-text-right">${Utils.formatCurrency(o.totale || 0)}</td>
        <td><span class="tag is-${(o.stato || 'attesa') === 'evasi' ? 'success' : 'warning'}">${(o.stato || 'attesa') === 'evasi' ? 'Evaso' : 'In Attesa'}</span></td>
        <td>
          <a class="button is-small is-info" href="dettaglio.html?id=${encodeURIComponent(o.id)}">Dettaglio</a>
        </td>
      `;

      tbody.appendChild(tr);
    });
  },

  updateStats() {
    const totalEl = document.getElementById('totOrdini');
    const valoreEl = document.getElementById('valoreTotale');

    const tot = this.filtered.length;
    const valore = this.filtered.reduce((sum, o) => sum + (o.totale || 0), 0);

    if (totalEl) totalEl.textContent = String(tot);
    if (valoreEl) valoreEl.textContent = Utils.formatCurrency(valore);
  }
};

document.addEventListener('DOMContentLoaded', () => OrdiniOutPage.init());
