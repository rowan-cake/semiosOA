import { expect, test } from 'vitest'
import { addDays, AS_OF_DATE, type Reading } from '../api/mockApi'
import { fieldAtRiskofFrost } from '../frostMonitoring'

test('frost risk includes zero on the first day and ignores missing, unrelated and out-of-range readings', () => {
  const field = { id: 'field-1', name: 'Test field', crop: 'Apples' }
  const stations = [
    { id: 's1', fieldId: field.id, label: 'S-01' },
    { id: 's2', fieldId: 'field-2', label: 'S-02' },
  ]
  const readings: Reading[] = [
    { stationId: 's1', date: AS_OF_DATE, lowTempC: null },
    { stationId: 's1', date: addDays(AS_OF_DATE, -7), lowTempC: -5 },
    { stationId: 's1', date: addDays(AS_OF_DATE, 1), lowTempC: -5 },
    { stationId: 's2', date: AS_OF_DATE, lowTempC: -5 },
    { stationId: 's1', date: addDays(AS_OF_DATE, -1), lowTempC: 2 },
  ]

  expect(fieldAtRiskofFrost(field, stations, readings)).toBe(false)
  readings.push({ stationId: 's1', date: addDays(AS_OF_DATE, -6), lowTempC: 0 })
  expect(fieldAtRiskofFrost(field, stations, readings)).toBe(true)
})
