import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOfficialData,
  SAMPLE_GIS_TORGI_XML,
  SAMPLE_NSPD_GEOJSON,
  SAMPLE_MUNICIPAL_CSV,
} from './dataImporter';

test('dataImporter correctly parses official GIS Torgi XML', () => {
  const result = parseOfficialData(SAMPLE_GIS_TORGI_XML, 'xml');
  assert.equal(result.success, true);
  assert.equal(result.importedCount, 2);
  assert.equal(result.parcels[0].cadastralNumber, '07:07:0900000:712');
  assert.equal(result.parcels[0].district, 'Урванский район');
  assert.equal(result.parcels[0].areaHa, 28.5);
  assert.equal(result.parcels[0].legal.isEligibleDirectLeaseWithoutAuction, true);
  assert.ok(result.parcels[0].history.length > 0);
});

test('dataImporter correctly parses NSPD GeoJSON feature collection', () => {
  const result = parseOfficialData(SAMPLE_NSPD_GEOJSON, 'geojson');
  assert.equal(result.success, true);
  assert.equal(result.importedCount, 1);
  assert.equal(result.parcels[0].cadastralNumber, '07:04:1100000:329');
  assert.equal(result.parcels[0].district, 'Прохладненский район');
  assert.equal(result.parcels[0].areaHa, 54.0);
  assert.ok(result.parcels[0].boundary.length >= 3);
});

test('dataImporter correctly parses Municipal CSV land reallocation funds', () => {
  const result = parseOfficialData(SAMPLE_MUNICIPAL_CSV, 'csv');
  assert.equal(result.success, true);
  assert.equal(result.importedCount, 2);
  assert.equal(result.parcels[0].cadastralNumber, '07:06:0500000:182');
  assert.equal(result.parcels[0].district, 'Черекский район');
  assert.equal(result.parcels[0].areaHa, 32.0);
});
