// documenti-dettaglio.js - CRUD per Documenti

const DocumentiDettaglio = {
    mode: 'view',
    documentoId: null,
    documento: null,

    init() {
        const params = Utils.getURLParams();
        this.documentoId = params.id;
        this.mode = params.mode || (this.documentoId ? 'view' : 'create');
        
        if (this.mode === 'create') {
            this.handleCreate();
        } else if (this.documentoId) {
            this.loadDocumento();
        }
        
        this.setupEventListeners();
        this.updateUI();
    },

    loadDocumento() {
        this.documento = Storage.getDocumento(this.documentoId);
        
        if (!this.documento) {
            Utils.showNotification('Documento non trovato', 'danger');
            setTimeout(() => {
                window.location.href = '../documenti.html';
            }, 2000);
            return;
        }
        
        this.populateForm();
        this.updatePageTitle();
    },

    handleCreate() {
        this.mode = 'edit';
        this.documento = {
            tipo: 'Fattura',
            data: new Date().toISOString().split('T')[0],
            stato: 'Bozza',
            importo: 0
        };
        this.updatePageTitle();
    },

    populateForm() {
        const form = document.getElementById('documentoForm');
        if (!form) return;
        Utils.setFormData(form, this.documento);
    },

    updatePageTitle() {
        const titleEl = document.querySelector('.content-header h1');
        if (titleEl) {
            titleEl.textContent = this.mode === 'create' ? 'Nuovo Documento' : `Documento ${this.documento?.codice || ''}`;
        }

        const breadcrumbActive = document.querySelector('.breadcrumb .is-active a');
        if (breadcrumbActive) {
            breadcrumbActive.textContent = this.mode === 'create' ? 'Nuovo' : this.documento?.codice || 'Dettaglio';
        }
    },

    updateUI() {
        const form = document.getElementById('documentoForm');
        if (!form) return;
        
        const isReadonly = this.mode === 'view';
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (isReadonly) {
                input.setAttribute('readonly', 'readonly');
                input.setAttribute('disabled', 'disabled');
            } else {
                input.removeAttribute('readonly');
                input.removeAttribute('disabled');
            }
        });
        
        const editBtn = document.getElementById('editBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (this.mode === 'view') {
            if (editBtn) editBtn.style.display = '';
            if (deleteBtn) deleteBtn.style.display = '';
            if (saveBtn) saveBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';
        } else {
            if (editBtn) editBtn.style.display = 'none';
            if (deleteBtn) deleteBtn.style.display = 'none';
            if (saveBtn) saveBtn.style.display = '';
            if (cancelBtn) cancelBtn.style.display = '';
        }
    },

    setupEventListeners() {
        const editBtn = document.getElementById('editBtn');
        if (editBtn) editBtn.onclick = () => this.enableEdit();

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.preventDefault();
                this.save();
            };
        }

        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) deleteBtn.onclick = () => this.delete();

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) cancelBtn.onclick = () => this.cancel();

        const form = document.getElementById('documentoForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.save();
            };
        }
    },

    enableEdit() {
        const newUrl = `${window.location.pathname}?id=${this.documentoId}&mode=edit`;
        window.history.pushState({}, '', newUrl);
        this.mode = 'edit';
        this.updateUI();
    },

    save() {
        const form = document.getElementById('documentoForm');
        const formData = Utils.getFormData(form);
        
        // Converti numeri
        if (formData.importo) formData.importo = parseFloat(formData.importo) || 0;

        const validation = Utils.validateForm(formData, {
            tipo: { required: true, label: 'Tipo Documento' },
            data: { required: true, label: 'Data' },
            controparte: { required: true, label: 'Cliente/Fornitore' }
        });
        
        if (!validation.isValid) {
            let errorMsg = 'Errori nel form:\n';
            Object.values(validation.errors).forEach(err => errorMsg += `• ${err}\n`);
            alert(errorMsg);
            return;
        }
        
        const documento = this.mode === 'create' ? formData : { ...this.documento, ...formData };
        Storage.saveDocumento(documento);
        
        Utils.showNotification(
            this.mode === 'create' ? 'Documento creato!' : 'Documento aggiornato!',
            'success'
        );
        
        setTimeout(() => window.location.href = '../documenti.html', 1500);
    },

    delete() {
        if (!Utils.confirm('Sei sicuro di voler eliminare questo documento?')) return;
        
        Storage.deleteDocumento(this.documentoId);
        Utils.showNotification('Documento eliminato', 'success');
        setTimeout(() => window.location.href = '../documenti.html', 1500);
    },

    cancel() {
        if (this.mode === 'create') {
            window.location.href = '../documenti.html';
        } else {
            const newUrl = `${window.location.pathname}?id=${this.documentoId}`;
            window.history.pushState({}, '', newUrl);
            this.mode = 'view';
            this.populateForm();
            this.updateUI();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DocumentiDettaglio.init();
});
