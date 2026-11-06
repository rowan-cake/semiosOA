// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AS_OF_DATE, getFields, getReadings, getStations } from '../api/mockApi'
import App from '../App'
import FieldDetail from '../FieldDetail'

vi.mock('../api/mockApi', async (importOriginal) => ({
  ...await importOriginal<typeof import('../api/mockApi')>(),
  getFields: vi.fn(),
  getStations: vi.fn(),
  getReadings: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

test('a failed request can be retried with the keyboard and reveals a labeled station link', async () => {
  const user = userEvent.setup()
  vi.mocked(getFields)
    .mockRejectedValueOnce(new Error('Network request failed'))
    .mockResolvedValueOnce([{ id: 'field-1', name: 'Test field', crop: 'Apples' }])
  vi.mocked(getStations).mockResolvedValue([{ id: 's1', fieldId: 'field-1', label: 'S-01' }])
  vi.mocked(getReadings).mockResolvedValue([{ stationId: 's1', date: AS_OF_DATE, lowTempC: 0 }])

  render(<App />)
  expect(screen.getByRole('status').textContent).toContain('Loading')
  expect((await screen.findByRole('alert')).textContent).toContain('Could not load')

  await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Try again' }))
  await user.keyboard('{Enter}')

  const stationLink = await screen.findByRole('link', { name: 'Weather Station view for Test field' })
  expect(stationLink.getAttribute('href')).toBe('/fields/field-1')
  expect(screen.getByText('At risk of frost')).toBeTruthy()
  expect(screen.queryByRole('alert')).toBeNull()
  expect(getFields).toHaveBeenCalledTimes(2)
  await user.tab()
  expect(document.activeElement).toBe(stationLink)
})

test('keyboard users can select a station and reach its daily readings toggle', async () => {
  const user = userEvent.setup()
  vi.mocked(getFields).mockResolvedValue([{ id: 'field-1', name: 'Test field', crop: 'Apples' }])
  vi.mocked(getStations).mockResolvedValue([
    { id: 's1', fieldId: 'field-1', label: 'S-01' },
    { id: 's2', fieldId: 'field-1', label: 'S-02' },
  ])
  vi.mocked(getReadings).mockResolvedValue([
    { stationId: 's1', date: AS_OF_DATE, lowTempC: 2 },
    { stationId: 's2', date: AS_OF_DATE, lowTempC: -1 },
  ])

  render(<FieldDetail fieldId="field-1" />)
  const secondStation = await screen.findByRole('button', { name: 'S-02' })
  await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('link', { name: '← All fields' }))
  await user.tab()
  await user.tab()
  expect(document.activeElement).toBe(secondStation)
  await user.keyboard('{Enter}')
  expect(secondStation.getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('heading', { name: 'S-02 · Daily low' })).toBeTruthy()

  await user.tab()
  const summary = screen.getByText('Daily temperatures')
  expect(document.activeElement).toBe(summary)
})
