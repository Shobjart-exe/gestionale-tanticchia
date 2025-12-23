// supabase-init.js - Inizializzazione e test connessione Supabase

/**
 * Script di inizializzazione per verificare che tutto sia configurato correttamente
 * Viene eseguito automaticamente al caricamento della pagina
 */

(async function initSupabase() {
    console.log('🔄 Inizializzazione Supabase in corso...');
    
    // Verifica che il client sia stato inizializzato
    if (typeof supabaseClient === 'undefined') {
        console.error('❌ Client Supabase non inizializzato!');
        console.error('Assicurati che supabase-config.js sia caricato correttamente.');
        return;
    }

    // Verifica che SupabaseStorage sia disponibile
    if (typeof SupabaseStorage === 'undefined') {
        console.error('❌ SupabaseStorage non disponibile!');
        console.error('Assicurati che supabase-storage.js sia caricato correttamente.');
        return;
    }

    try {
        // Test connessione con una query semplice
        console.log('🔍 Test connessione al database...');
        
        const { data, error } = await supabaseClient
            .from('clienti')
            .select('count', { count: 'exact', head: true });

        if (error) {
            // Se errore codice 42P01 = tabella non esiste
            if (error.code === '42P01') {
                console.warn('⚠️ ATTENZIONE: Le tabelle non sono ancora state create su Supabase!');
                console.warn('📝 Vai su Supabase Dashboard > SQL Editor e esegui lo script schema.sql');
                console.warn('🔗 Dashboard: https://supabase.com/dashboard/project/lkjkuqizpauustexolcu');
                showDatabaseAlert();
            } else {
                throw error;
            }
        } else {
            console.log('✅ Connessione al database verificata con successo!');
            console.log('📊 Sistema pronto per l\'uso');
        }

    } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione:', error.message);
        console.error('Dettagli completi:', error);
        
        // Mostra un alert per l'utente
        showErrorAlert(error.message);
    }
})();

/**
 * Mostra un alert visivo per avvisare che le tabelle non sono create
 */
function showDatabaseAlert() {
    // Crea un banner di avviso visibile nella pagina
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f39c12;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = `
        <strong>⚠️ Database non configurato</strong><br>
        <span style="font-size: 0.9em;">
            Le tabelle del database non sono state ancora create. 
            <a href="https://supabase.com/dashboard/project/lkjkuqizpauustexolcu/editor" 
               target="_blank" 
               style="color: white; text-decoration: underline;">
                Vai alla Dashboard Supabase
            </a> 
            ed esegui lo script SQL fornito.
        </span>
    `;
    
    // Inserisce il banner solo se non esiste già
    if (!document.getElementById('supabase-warning-banner')) {
        banner.id = 'supabase-warning-banner';
        document.body.insertBefore(banner, document.body.firstChild);
    }
}

/**
 * Mostra un alert per errori generici
 */
function showErrorAlert(message) {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #e74c3c;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = `
        <strong>❌ Errore di connessione a Supabase</strong><br>
        <span style="font-size: 0.9em;">${message}</span>
    `;
    
    if (!document.getElementById('supabase-error-banner')) {
        banner.id = 'supabase-error-banner';
        document.body.insertBefore(banner, document.body.firstChild);
    }
}

// Log di caricamento
console.log('✅ Script di inizializzazione Supabase caricato');
