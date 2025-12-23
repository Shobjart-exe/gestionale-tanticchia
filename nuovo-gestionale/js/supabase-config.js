/**
 * supabase-config.js
 * Configurazione e inizializzazione client Supabase
 */

// 1. Credenziali
const SUPABASE_URL = 'https://lkjkuqizpauustexolcu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NgFju8MUbDU36iaujYRK8g_MjdEOPC2';

// 2. Dichiarazione globale della variabile
// Usiamo 'supabaseClient' per coerenza con il resto del tuo progetto
let supabaseClient;

try {
    // Verifica che l'SDK sia presente
    if (typeof window.supabase === 'undefined') {
        throw new Error('SDK Supabase non trovato. Verifica di aver inserito lo script CDN nell’HTML prima di questo file.');
    }
    
    // 3. Inizializzazione
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Client Supabase inizializzato correttamente');
    
} catch (error) {
    console.error('❌ Errore critico inizializzazione:', error.message);
}

/**
 * Funzione di test rapido
 * Può essere chiamata dalla console (F12) per verificare se il database risponde
 */
async function testDatabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('clienti')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        console.log('✅ Connessione stabilita e tabelle raggiungibili!');
        return true;
    } catch (error) {
        console.error('⚠️ Problema di connessione o tabelle mancanti:', error.message);
        return false;
    }
}