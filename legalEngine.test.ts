import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLegalStatus } from './legalEngine';

test('legalEngine correctly evaluates direct lease under Art. 39.18 for agricultural KFH land', () => {
  const result = evaluateLegalStatus({
    category: 'Земли сельскохозяйственного назначения',
    permittedUseCode: '1.5',
    areaHa: 25,
    ownership: 'Государственная (неразграниченная)',
    district: 'Чегемский район',
    hasAuctionNotice: false,
    nearWaterBody: false,
    nearPowerLineOrGas: false,
    targetPurpose: 'kfh',
  });

  assert.equal(result.isEligibleDirectLeaseWithoutAuction, true);
  assert.equal(result.requiresTerritorySchemeKPT, true);
  assert.ok(result.applicableLaws.some((l) => l.article.includes('39.18')));
  assert.ok(result.stepByStepActionPlan.length >= 5);
  assert.ok(result.requiredDocuments.length >= 4);
});

test('legalEngine detects water protection restrictions when near water body', () => {
  const result = evaluateLegalStatus({
    category: 'Земли сельскохозяйственного назначения',
    permittedUseCode: '1.5',
    areaHa: 40,
    ownership: 'Муниципальная',
    district: 'Черекский район',
    hasAuctionNotice: false,
    nearWaterBody: true,
    nearPowerLineOrGas: true,
    targetPurpose: 'orchard',
  });

  const waterRestriction = result.restrictionsAndEncumbrances.find((r) =>
    r.type.includes('Водоохранная')
  );
  assert.ok(waterRestriction);
  assert.equal(waterRestriction.isBlocking, false); // restrictions are non-blocking with proper regulations
});

test('legalEngine handles pending auctions on GIS Torgi', () => {
  const result = evaluateLegalStatus({
    category: 'Земли сельскохозяйственного назначения',
    permittedUseCode: '1.1',
    areaHa: 50,
    ownership: 'Муниципальная',
    district: 'Прохладненский район',
    hasAuctionNotice: true,
    nearWaterBody: false,
    nearPowerLineOrGas: false,
    targetPurpose: 'kfh',
  });

  // When an auction notice is already published, direct lease without auction is no longer available
  assert.equal(result.isEligibleDirectLeaseWithoutAuction, false);
  assert.equal(result.hasAuctionNoticePublished, true);
});
