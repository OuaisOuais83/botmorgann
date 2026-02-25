const { describe, it } = require('node:test');
const assert = require('node:assert');
const monitor = require('../src/utils/health');

describe('health monitor', () => {
    it('getSystemStatus retourne un objet valide', () => {
        const status = monitor.getSystemStatus();
        assert.ok(status);
        assert.strictEqual(status.status, 'ONLINE');
        assert.ok(typeof status.uptime === 'string');
        assert.ok(status.memory);
        assert.ok(status.memory.rss);
        assert.ok(status.memory.heapUsed);
        assert.ok(Array.isArray(status.lastErrors));
    });
    it('formatUptime existe via getSystemStatus', () => {
        const status = monitor.getSystemStatus();
        assert.match(status.uptime, /\d+j \d+h \d+m \d+s/);
    });
});
