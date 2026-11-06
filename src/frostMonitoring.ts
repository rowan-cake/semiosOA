import {addDays, AS_OF_DATE, type Field, type Station, type Reading} from './api/mockApi.ts'


// Risk if any of its stations recorded a daily low of 0 °C or below in the last 7
// days.


// Requires: Stations and readings have already been fetched.
// Modifies: nothing
// Effects: Returns true if the field is at risk of frost. False otherwise
export function fieldAtRiskofFrost(field:Field, stations:readonly Station[], readings:readonly Reading[]):boolean{
    return summarizeFieldFrost(field, stations, readings).atRisk
}

// Requires: Stations and readings have already been fetched.
// Modifies: nothing
// Effects: Returns the coldest reported low among the field's stations in the
// seven days ending on AS_OF_DATE, inclusive. Missing temperatures are skipped.
// If there are no valid readings, coldestLow is null and atRisk is false.
// Otherwise, atRisk is true when coldestLow is 0 °C or below.
export function summarizeFieldFrost(field:Field, stations:readonly Station[], readings:readonly Reading[]){
    const stationIds = new Set(stations.filter(station => station.fieldId === field.id).map(station => station.id))
    const startDate = addDays(AS_OF_DATE, -6)
    let coldestLow: number | null = null

    for (const { stationId, date, lowTempC } of readings) {
        if (!stationIds.has(stationId) || date < startDate || date > AS_OF_DATE || lowTempC === null) continue
        coldestLow = coldestLow === null ? lowTempC : Math.min(coldestLow, lowTempC)
    }

    return { coldestLow, atRisk: coldestLow !== null && coldestLow <= 0 }
}
