const os = require('os');

class HealthMonitor {
    constructor() {
        this.errors = [];
        this.startTime = Date.now();
    }

    logError(error, context = 'General') {
        const entry = {
            timestamp: new Date().toISOString(),
            context,
            message: error.message || error,
            stack: error.stack
        };
        this.errors.push(entry);
        // Garder seulement les 50 dernières erreurs
        if (this.errors.length > 50) this.errors.shift();
    }

    getSystemStatus() {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();

        return {
            status: 'ONLINE',
            uptime: this.formatUptime(uptime),
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
            },
            system: {
                platform: os.platform(),
                cpuLoad: os.loadavg()
            },
            errorCount: this.errors.length,
            lastErrors: this.errors.slice(-3)
        };
    }

    formatUptime(seconds) {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}j ${h}h ${m}m ${s}s`;
    }
}

// Instance globale
const monitor = new HealthMonitor();
module.exports = monitor;
