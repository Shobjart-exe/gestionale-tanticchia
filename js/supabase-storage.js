/**
 * SupabaseStorage - Gestione Database
 */

// Recuperiamo l'istanza di supabase creata nel file di configurazione
// Assicurati che in supabase-config.js la variabile si chiami 'supabase'
const db = supabaseClient; 

const SupabaseStorage = {
    TABLES: {
        CLIENTI: 'clienti',
        FORNITORI: 'fornitori',
        PRODOTTI: 'prodotti',
        MATERIE_PRIME: 'materie_prime',
        ORDINI_IN: 'ordini_in',
        ORDINI_OUT: 'ordini_out',
        DOCUMENTI: 'documenti',
        RICETTE: 'ricette' // Aggiunta tabella ricette
    },

    // --- FUNZIONI DI BASE (CRUD) ---

    async getAll(tableName, orderBy = 'created_at', ascending = false) {
        try {
            const { data, error } = await db
                .from(tableName)
                .select('*')
                .order(orderBy, { ascending });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error(`Errore getAll su ${tableName}:`, error.message);
            return [];
        }
    },

    async save(tableName, item) {
        try {
            if (item.id) {
                const { data, error } = await db
                    .from(tableName)
                    .update({ ...item, updated_at: new Date().toISOString() })
                    .eq('id', item.id)
                    .select().single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await db
                    .from(tableName)
                    .insert([item])
                    .select().single();
                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error(`Errore save su ${tableName}:`, error.message);
            return null;
        }
    },

    // --- LOGICA SPECIALE PER RICETTE E CRAFTING ---

    /**
     * Salva i componenti di un prodotto (La "Ricetta")
     */
    async saveRicetta(prodottoId, componenti) {
        try {
            // 1. Elimina i vecchi componenti
            await db.from('ricette').delete().eq('prodotto_id', prodottoId);
            
            // 2. Inserisce i nuovi
            const rows = componenti.map(c => ({
                prodotto_id: prodottoId,
                materia_prima_id: c.materia_prima_id,
                quantita_necessaria: c.quantita_necessaria
            }));

            const { error } = await db.from('ricette').insert(rows);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Errore salvataggio ricetta:", error.message);
            return false;
        }
    },

    /**
     * Calcola quanti pezzi puoi produrre
     */
    async getPezziCraftabili(prodottoId) {
        try {
            // Prende i materiali necessari e quanto ne hai in magazzino
            const { data: ricetta, error } = await db
                .from('ricette')
                .select(`
                    quantita_necessaria,
                    materie_prime ( quantita_disponibile )
                `)
                .eq('prodotto_id', prodottoId);

            if (error) throw error;
            if (!ricetta || ricetta.length === 0) return 0;

            let maxPezzi = Infinity;

            ricetta.forEach(r => {
                const disp = r.materie_prime.quantita_disponibile || 0;
                const nec = r.quantita_necessaria;
                const possibile = Math.floor(disp / nec);
                if (possibile < maxPezzi) maxPezzi = possibile;
            });

            return maxPezzi === Infinity ? 0 : maxPezzi;
        } catch (error) {
            console.error("Errore calcolo pezzi:", error.message);
            return 0;
        }
    }
};

console.log('✅ SupabaseStorage aggiornato con successo');