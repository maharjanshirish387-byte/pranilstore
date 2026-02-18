// ==================== DATABASE OPERATIONS ====================
// SQL Database Interface for Pranil Sales and Marketing Platform

const Database = {
    // In a production environment, this would connect to an actual SQL database
    // For this demo, we'll simulate SQL operations with localStorage
    // but structure the code as if using real SQL

    initialized: false,

    // Initialize database (simulate SQL setup)
    async init() {
        if (this.initialized) return;

        console.log('[Database] Initializing SQL database...');
        
        // Simulate database initialization
        this.ensureTables();
        this.initialized = true;

        console.log('[Database] Initialization complete');
    },

    // Ensure all tables exist (simulate CREATE TABLE)
    ensureTables() {
        const tables = ['customers', 'companies', 'products', 'orders', 'order_items'];
        
        tables.forEach(table => {
            if (!localStorage.getItem(`pranil_${table}`)) {
                localStorage.setItem(`pranil_${table}`, JSON.stringify([]));
            }
        });
    },

    // Execute SELECT query
    async select(table, conditions = {}) {
        const data = JSON.parse(localStorage.getItem(`pranil_${table}`) || '[]');
        
        if (Object.keys(conditions).length === 0) {
            return data;
        }

        return data.filter(record => {
            return Object.entries(conditions).every(([key, value]) => {
                return record[key] === value;
            });
        });
    },

    // Execute INSERT query
    async insert(table, record) {
        const data = JSON.parse(localStorage.getItem(`pranil_${table}`) || '[]');
        
        // Add timestamp
        record.created_at = new Date().toISOString();
        record.updated_at = new Date().toISOString();
        
        data.push(record);
        localStorage.setItem(`pranil_${table}`, JSON.stringify(data));
        
        return record;
    },

    // Execute UPDATE query
    async update(table, conditions, updates) {
        const data = JSON.parse(localStorage.getItem(`pranil_${table}`) || '[]');
        let updated = false;

        const newData = data.map(record => {
            const matches = Object.entries(conditions).every(([key, value]) => {
                return record[key] === value;
            });

            if (matches) {
                updated = true;
                return { 
                    ...record, 
                    ...updates, 
                    updated_at: new Date().toISOString() 
                };
            }

            return record;
        });

        if (updated) {
            localStorage.setItem(`pranil_${table}`, JSON.stringify(newData));
        }

        return updated;
    },

    // Execute DELETE query
    async delete(table, conditions) {
        const data = JSON.parse(localStorage.getItem(`pranil_${table}`) || '[]');
        
        const newData = data.filter(record => {
            return !Object.entries(conditions).every(([key, value]) => {
                return record[key] === value;
            });
        });

        localStorage.setItem(`pranil_${table}`, JSON.stringify(newData));
        
        return data.length - newData.length;
    },

    // Get single record
    async findOne(table, conditions) {
        const results = await this.select(table, conditions);
        return results.length > 0 ? results[0] : null;
    },

    // Execute JOIN operation
    async join(mainTable, joinTable, mainKey, joinKey, conditions = {}) {
        const mainData = await this.select(mainTable, conditions);
        const joinData = await this.select(joinTable);

        return mainData.map(mainRecord => {
            const joined = joinData.filter(joinRecord => 
                joinRecord[joinKey] === mainRecord[mainKey]
            );

            return {
                ...mainRecord,
                [joinTable]: joined
            };
        });
    },

    // Get aggregated stats
    async aggregate(table, conditions, aggregations) {
        const data = await this.select(table, conditions);
        
        const result = {};

        if (aggregations.count) {
            result.count = data.length;
        }

        if (aggregations.sum) {
            aggregations.sum.forEach(field => {
                result[`sum_${field}`] = data.reduce((sum, record) => 
                    sum + (parseFloat(record[field]) || 0), 0
                );
            });
        }

        if (aggregations.avg) {
            aggregations.avg.forEach(field => {
                const sum = data.reduce((sum, record) => 
                    sum + (parseFloat(record[field]) || 0), 0
                );
                result[`avg_${field}`] = data.length > 0 ? sum / data.length : 0;
            });
        }

        return result;
    },

    // Transaction support (simulate BEGIN/COMMIT/ROLLBACK)
    async transaction(operations) {
        const snapshot = {};
        const tables = ['customers', 'companies', 'products', 'orders', 'order_items'];

        // Create snapshot
        tables.forEach(table => {
            snapshot[table] = localStorage.getItem(`pranil_${table}`);
        });

        try {
            // Execute all operations
            for (const operation of operations) {
                await operation();
            }

            return { success: true };
        } catch (error) {
            // Rollback on error
            tables.forEach(table => {
                if (snapshot[table]) {
                    localStorage.setItem(`pranil_${table}`, snapshot[table]);
                }
            });

            return { success: false, error: error.message };
        }
    },

    // Utility: Hash password (simplified for demo)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },

    // Utility: Generate unique ID
    generateId(prefix = '') {
        return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Clear all data (for testing)
    async clearAll() {
        const tables = ['customers', 'companies', 'products', 'orders', 'order_items'];
        tables.forEach(table => {
            localStorage.removeItem(`pranil_${table}`);
        });
        this.initialized = false;
        await this.init();
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.Database = Database;
    Database.init();
}