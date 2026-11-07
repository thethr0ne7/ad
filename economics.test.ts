import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEconomics } from './economics';

test('economics calculator calculates cadastral value and annual rent correctly for Urvanskiy district', () => {
  const econ = calculateEconomics({
    areaHa: 20,
    district: 'Урванский район',
    purpose: 'orchard',
    utilities: {
      hasRoadAccess: true,
      roadType: 'Асфальтированная',
      distanceToHighwayKm: 1.2,
      hasElectricity: true,
      electricityDistanceM: 50,
      hasGas: true,
      gasDistanceM: 200,
      waterSource: 'Река/канал (открытый водозабор)',
      distanceToWaterM: 100,
      reliefType: 'Равнинный',
      elevationMeters: 310,
    },
  });

  // Urvanskiy baseline is 135,000 rub/ha => 20 ha = 2,700,000 rub
  assert.equal(econ.cadastralValueRub, 2700000);
  assert.equal(econ.annualRentRub, Math.round(2700000 * 0.006));
  assert.ok(econ.estimatedCapex.totalCapexRub > 0);
  assert.ok(econ.eligibleSubsidies.length >= 2);
  assert.ok(econ.projectedPaybackYears > 0 && econ.projectedPaybackYears < 10);
});

test('economics calculator adds agrotourism subsidies when selected', () => {
  const econ = calculateEconomics({
    areaHa: 10,
    district: 'Черекский район',
    purpose: 'agrotourism',
    utilities: {
      hasRoadAccess: true,
      roadType: 'Грунтовая улучшенная (гравий)',
      distanceToHighwayKm: 3.5,
      hasElectricity: false,
      electricityDistanceM: 400,
      hasGas: false,
      gasDistanceM: 1200,
      waterSource: 'Артезианская скважина (требует бурения)',
      distanceToWaterM: 500,
      reliefType: 'Предгорный (3-8°)',
      elevationMeters: 850,
    },
  });

  const agrotourismGrant = econ.eligibleSubsidies.find((s) => s.programName.includes('Агротуризм'));
  assert.ok(agrotourismGrant);
  assert.equal(agrotourismGrant.maxAmountRub, 10000000);
});
