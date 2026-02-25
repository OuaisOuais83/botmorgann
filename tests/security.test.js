const { describe, it } = require('node:test');
const assert = require('node:assert');
const security = require('../src/utils/security');

describe('security', () => {
    describe('validateURL', () => {
        it('accepte youtube.com', () => {
            const r = security.validateURL('https://youtube.com/watch?v=abc');
            assert.strictEqual(r.valid, true);
        });
        it('accepte youtu.be', () => {
            const r = security.validateURL('https://youtu.be/abc');
            assert.strictEqual(r.valid, true);
        });
        it('refuse http (non https) pour certains cas - en fait http est autorisé', () => {
            const r = security.validateURL('http://youtube.com/watch?v=abc');
            assert.strictEqual(r.valid, true);
        });
        it('refuse un domaine non autorisé', () => {
            const r = security.validateURL('https://evil.com/malware');
            assert.strictEqual(r.valid, false);
        });
    });
    describe('requiresDoubleVerification', () => {
        it('retourne true pour 200€', () => {
            assert.strictEqual(security.requiresDoubleVerification(200), true);
        });
        it('retourne true pour 500€', () => {
            assert.strictEqual(security.requiresDoubleVerification(500), true);
        });
        it('retourne false pour 199€', () => {
            assert.strictEqual(security.requiresDoubleVerification(199), false);
        });
    });
});
