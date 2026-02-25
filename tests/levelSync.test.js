const { describe, it } = require('node:test');
const assert = require('node:assert');
const { calculateLevel } = require('../src/utils/levelSync');

describe('levelSync - calculateLevel', () => {
    it('retourne rookie pour 0 points', () => {
        assert.strictEqual(calculateLevel(0), 'rookie');
    });
    it('retourne rookie pour 500 points', () => {
        assert.strictEqual(calculateLevel(500), 'rookie');
    });
    it('retourne hustler pour 501 points', () => {
        assert.strictEqual(calculateLevel(501), 'hustler');
    });
    it('retourne hustler pour 2000 points', () => {
        assert.strictEqual(calculateLevel(2000), 'hustler');
    });
    it('retourne grinder pour 2001 points', () => {
        assert.strictEqual(calculateLevel(2001), 'grinder');
    });
    it('retourne grinder pour 5000 points', () => {
        assert.strictEqual(calculateLevel(5000), 'grinder');
    });
    it('retourne elite pour 5001 points', () => {
        assert.strictEqual(calculateLevel(5001), 'elite');
    });
    it('retourne elite pour 999999 points', () => {
        assert.strictEqual(calculateLevel(999999), 'elite');
    });
});
