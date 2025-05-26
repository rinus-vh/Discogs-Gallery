import { parse } from 'csv-parse/browser/esm'
import { stringify } from 'csv-stringify/browser/esm'
import { v5 as uuidv5 } from 'uuid'

const UUID_NAMESPACE = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

function generateId(releaseId, index) {
  return uuidv5(`${releaseId}-${index}`, UUID_NAMESPACE)
}

export async function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result
      if (!content) return reject(new Error('Failed to read file'))

      parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        relax_quotes: true,
      }, (err, rows) => {
        if (err) return reject(err)

        const records = rows.map((record, index) => {
          const releaseId = record.release_id || record['Release ID'] || index
          const id = generateId(releaseId, index)

          const normalizeArray = (val) => {
            if (!val) return []
            if (Array.isArray(val)) return val
            return val.toString().split(/[,;]/).map(s => s.trim()).filter(Boolean)
          }

          return {
            ...record,
            id,
            'Catalog#': record['Catalog#'] || '',
            Artist: record.Artist || '',
            Title: record.Title || '',
            Label: normalizeArray(record.Label),
            Format: normalizeArray(record.Format),
            Rating: isNaN(Number(record.Rating)) ? undefined : Number(record.Rating),
            Released: isNaN(Number(record.Released)) ? undefined : Number(record.Released),
            release_id: record.release_id || record['Release ID'],
            Notes: record.Notes || '',
            Genres: normalizeArray(record.Genres),
            'Primary Genre': record['Primary Genre'] || normalizeArray(record.Genres)[0] || '',
            'Image url': record['Image url'] || '',

            CollectionFolder: record.CollectionFolder || record['Collection Folder'] || '',
            'Date Added': record['Date Added'] || '',
            'Collection Media Condition': record['Collection Media Condition'] || '',
            'Collection Sleeve Condition': record['Collection Sleeve Condition'] || '',
            'Collection Originally from': record['Collection Originally from'] || '',
            'Collection Notes': record['Collection Notes'] || '',
          }
        })

        resolve(records)
      })
    }

    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

export async function generateCsv(records) {
  return new Promise((resolve, reject) => {
    const processedRecords = records.map(r => {
      const clone = { ...r }
      if (Array.isArray(clone.Label)) clone.Label = clone.Label.join(', ')
      if (Array.isArray(clone.Format)) clone.Format = clone.Format.join(', ')
      if (Array.isArray(clone.Genres)) clone.Genres = clone.Genres.join(', ')
      return clone
    })

    const columnSet = new Set()
    processedRecords.forEach(r => Object.keys(r).forEach(k => columnSet.add(k)))
    const columns = Array.from(columnSet).sort()

    stringify(processedRecords, {
      header: true,
      columns,
      cast: {
        object: (val) => Array.isArray(val) ? val.join(', ') : val
      }
    }, (err, output) => {
      if (err) return reject(err)
      resolve(output)
    })
  })
}

export function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
