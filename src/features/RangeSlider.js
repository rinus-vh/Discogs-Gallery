/** @typedef {import('types').VinylRecord} VinylRecord */

import { useMemo } from 'react'

import styles from './RangeSlider.module.css'

/**
 * @param {{
 *   yearRange: [number, number],
 *   selectedYearRange: [number, number],
 *   setSelectedYearRange: (range: [number, number]) => void,
 *   records: VinylRecord[]
 * }} props
 */
export function RangeSlider({ yearRange, selectedYearRange, setSelectedYearRange, records }) {
  const yearDistribution = useYearDistribution(records, yearRange)
  const maxCount = useMaxCount(yearDistribution)

  return (
    <div>
      <div className={styles.chartContainer}>
        <SelectedRangeHighlight {...{ yearRange, selectedYearRange }} />
        <BarChart {...{ yearRange, yearDistribution, maxCount }} />
        <RangeInputs {...{ yearRange, selectedYearRange, setSelectedYearRange }} />
      </div>

      <RangeLabels selectedYearRange={selectedYearRange} />
    </div>
  )
}

/**
 * @param {{
 *   yearRange: [number, number],
 *   yearDistribution: { [year: number]: number },
 *   maxCount: number
 * }} props
 */
function BarChart({ yearRange, yearDistribution, maxCount }) {
  const [minYear, maxYear] = yearRange
  const entriesCount = Object.entries(yearDistribution).length

  return (
    <div style={{ gridTemplateColumns: `repeat(${entriesCount}, 1fr)` }} className={styles.componentBarChart}>
      {Object.entries(yearDistribution).map(([year, count], i) => {
        const heightPercent = (count / maxCount) * 100
        const leftPercent = ((parseInt(year) - minYear) / (maxYear - minYear)) * 100

        return (
          <div
            key={year}
            style={{ height: `${heightPercent}%`, gridColumn: i }}
            className={styles.bar}
          />
        )
      })}
    </div>
  )
}

/** @param {{ yearRange: [number, number], selectedYearRange: [number, number] }} props */
function SelectedRangeHighlight({ yearRange, selectedYearRange }) {
  const [minYear, maxYear] = yearRange
  const [selectedStart, selectedEnd] = selectedYearRange

  const left = ((selectedStart - minYear) / (maxYear - minYear)) * 100
  const right = 100 - ((selectedEnd - minYear) / (maxYear - minYear)) * 100

  return (
    <div style={{ transform: `translateX(${left}%)` }} className={styles.componentSelectedRangeHighlight}>
      <span
        style={{ width: `${ 100 - left - right}%` }}
        className={styles.highlight}
      />
    </div>
  )
}

/**
 * @param {{
 *   yearRange: [number, number],
 *   selectedYearRange: [number, number],
 *   setSelectedYearRange: (range: [number, number]) => void
 * }} props
 */
function RangeInputs({ yearRange, selectedYearRange, setSelectedYearRange }) {
  const [start, end] = selectedYearRange

  return (
    <div className={styles.componentRangeInputs}>
      <input
        type="range"
        min={yearRange[0]}
        max={yearRange[1]}
        value={start}
        onChange={(e) =>
          setSelectedYearRange([
            Math.min(parseInt(e.target.value), end),
            end
          ])
        }
        className={styles.rangeSliderMin}
      />

      <input
        type="range"
        min={yearRange[0]}
        max={yearRange[1]}
        value={end}
        onChange={(e) =>
          setSelectedYearRange([
            start,
            Math.max(parseInt(e.target.value), start)
          ])
        }
        className={styles.rangeSliderMax}
      />
    </div>
  )
}

/**
 * @param {{ selectedYearRange: [number, number] }} props
 */
function RangeLabels({ selectedYearRange }) {
  return (
    <div className={styles.labels}>
      <span>{selectedYearRange[0]}</span>
      <span>{selectedYearRange[1]}</span>
    </div>
  )
}

/**
 * @param {VinylRecord[]} records
 * @param {[number, number]} range
 * @returns {{ [year: number]: number }}
 */
function useYearDistribution(records, [minYear, maxYear]) {
  return useMemo(() => {
    const distribution = {}
    for (let year = minYear; year <= maxYear; year++) {
      distribution[year] = 0
    }

    records.forEach(record => {
      if (record.Released && record.Released >= minYear && record.Released <= maxYear) {
        distribution[record.Released]++
      }
    })

    return distribution
  }, [records, minYear, maxYear])
}

/**
 * @param {{ [year: number]: number }} distribution
 * @returns {number}
 */
function useMaxCount(distribution) {
  return useMemo(() => {
    return Math.max(...Object.values(distribution))
  }, [distribution])
}