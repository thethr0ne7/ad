import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyCadastralNumber } from './cadastralVerifier';

test('cadastralVerifier validates standard Russian cadastral number in KBR', () => {
  const result = verifyCadastralNumber('07:07:1200000:148');
  assert.equal(result.isValidCadastralFormat, true);
  assert.equal(result.regionCode, '07');
  assert.equal(result.regionName, 'Кабардино-Балкарская Республика');
  assert.equal(result.districtName, 'Урванский район');
  assert.equal(result.isRegisteredInKbrRegistry, false); // demo dataset is not EGRN verification
  assert.ok(decodeURIComponent(result.directLinks.rosreestrPkkUrl).includes('07:07:1200000:148'));
  assert.ok(decodeURIComponent(result.directLinks.gisTorgiUrl).includes('07:07:1200000:148'));
});

test('cadastralVerifier rejects invalid formats cleanly', () => {
  const result = verifyCadastralNumber('invalid-number-123');
  assert.equal(result.isValidCadastralFormat, false);
  assert.equal(result.isRegisteredInKbrRegistry, false);
});
