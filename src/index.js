require('dotenv').config()

const express = require('express')
const osuApi = require('./osu-api.js')
const promMid = require('express-prometheus-middleware');


const app = express()

app.use(express.json())

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
}))

const modes = ['osu', 'taiko', 'fruits', 'mania']

const max_rank = 10000

app.get('/players/:id', async (req, res) => {
  try {
    const mode = req.query.mode ?? 'osu'

    if (!modes.includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode' })
    }

    const player = await osuApi.getPlayer(req.params.id, mode)

    res.json(getPlayerInfo(player))

  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/players/by-rank/:rank', async (req, res) => {
  try {
    const rank = parseInt(req.params.rank)

    if (isNaN(rank) || rank < 1 || rank > max_rank) {
      return res.status(400).json({ error: 'Invalid rank' })
    }

    const mode = req.query.mode ?? 'osu'

    if (!modes.includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode' })
    }

    const player = await osuApi.getPlayerByRank(rank, mode)

    res.json(getPlayerInfo(player))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal server error' })
  }
})

function getPlayerInfo(player) {
  const { id, username, avatar_url, country_code, statistics } = player

  return {
    id,
    username,
    avatar_url,
    country_code,
    global_rank: statistics.global_rank,
    country_rank: statistics.rank.country,
    pp: statistics.pp,
    accuracy: statistics.hit_accuracy,
    play_count: statistics.play_count,
    play_time: statistics.play_time,
  }

}

async function main() {
  await osuApi.login()

  app.listen(3000, () => {
    console.log('Server is running on port 3000')
  })
}

main()