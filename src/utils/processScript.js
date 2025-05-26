import { v5 as uuidv5 } from 'uuid'

const UUID_NAMESPACE = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

const MAX_RETRIES = 3

function generateId(releaseId, index) {
  return uuidv5(`${releaseId}-${index}`, UUID_NAMESPACE)
}

export async function processRecords(rawData, token, onProgress, onLog) {
  const results = []
  let requestCount = 0

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i]
    const releaseId = item.release_id || item['Release ID']
    if (!releaseId) continue

    if (requestCount >= 60) {
      onLog('⏳ Reached 60 requests. Waiting 60 seconds to avoid rate limiting...')
      await waitForRateLimit(onLog)
      requestCount = 0
    }

    let retries = 0
    let success = false

    while (!success && retries < MAX_RETRIES) {
      try {
        const res = await fetch(`https://api.discogs.com/releases/${releaseId}`, {
          headers: {
            Authorization: `Discogs token=${token}`,
            'User-Agent': 'VinylCollectionSorter/1.0',
          }
        })

        requestCount++

        if (res.status === 429) {
          await waitForRateLimit(onLog)
          requestCount = 0
          continue
        }

        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data = await res.json()
        const artist = data.artists?.[0]?.name.split('(')[0].trim() || item.Artist || 'Unknown Artist'

        const record = {
          ...item,
          id: generateId(releaseId, i),
          Artist: artist,
          Title: data.title || item.Title || 'Unknown Title',
          Label: data.labels?.map(l => l.name) || [],
          Format: data.formats?.map(f => f.name) || [],
          Rating: data.community?.rating?.average || item.Rating,
          Released: data.year || item.Released,
          release_id: releaseId,
          Genres: data.genres || [],
          'Primary Genre': data.genres?.[0] || '',
          'Image url': data.images?.[0]?.uri || `https://placehold.co/500x500/333/fff?text=${encodeURIComponent(artist)}`,
          ...(item['Collection Folder'] && { CollectionFolder: item['Collection Folder'] }),
          ...(item['Collection Media Condition'] && { 'Collection Media Condition': item['Collection Media Condition'] }),
          ...(item['Collection Sleeve Condition'] && { 'Collection Sleeve Condition': item['Collection Sleeve Condition'] }),
          ...(item['Collection Notes'] && { 'Collection Notes': item['Collection Notes'] }),
          ...(item['Collection Originally from'] && { 'Collection Originally from': item['Collection Originally from'] }),
          ...(item['Date Added'] && { 'Date Added': item['Date Added'] }),
          ...(item['Catalog#'] && { 'Catalog#': item['Catalog#'] }),
          ...(item.Notes && { Notes: item.Notes }),
        }

        results.push(record)
        onLog(`🎵 ${artist} | ${record.Released} | [${record.Genres.join(', ')}]`)
        success = true

      } catch (err) {
        if (err instanceof TypeError || (err.message && err.message.includes('fetch'))) {
          onLog(`❌ Network error while processing release ${releaseId}`)
          onLog('⚠️ Waiting 60 seconds before retrying to prevent rate limit...')
          await waitForRateLimit(onLog)
          retries++
          requestCount = 0
        } else {
          onLog(`❌ Error processing release ${releaseId}: ${err.message || err}`)
          success = true // skip this record
        }
      }
    }

    onProgress(Math.round(((i + 1) / rawData.length) * 100))
  }

  results.sort((a, b) => {
    const artistDiff = a.Artist.localeCompare(b.Artist)
    return artistDiff !== 0 ? artistDiff : (a.Released || 0) - (b.Released || 0)
  })

  onProgress(100)
  return results
}

async function waitForRateLimit(onLog) {
  for (let i = 60; i > 0; i--) {
    onLog(`⏳ Retrying in ${i} seconds...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  onLog('🔄 Resuming requests...')
}
