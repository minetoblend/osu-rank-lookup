const { v2, auth } = require('osu-api-extended')
const ExpiryMap = require('expiry-map')

const userCache = new ExpiryMap(/* 10 minutes */ 10 * 60 * 1000)

class OsuApi {
  async login() {
    const cliend_id = process.env.OSU_CLIENT_ID
    const client_secret = process.env.OSU_CLIENT_SECRET
  
    await auth.login(cliend_id, client_secret, ['public']);
  }

  async getPlayerByRank(rank, mode = 'osu') {

    const page = Math.floor((rank - 1) / 50) + 1
  
    const result = await v2.site.ranking.details(mode, 'performance', {
      "cursor[page]": page,
    })
  
    const index = (rank - 1) % 50
  
    const player = result.ranking[index]

    if(!player) {
      throw new Error('Player not found')
    }

    return await this.getPlayer(player.user.id, mode)
  }

  async getPlayer(id, mode = 'osu') {
    const cached = userCache.get(id)
    if (cached) {
      return cached
    }

    const player = await v2.user.details(id, mode)
    
    userCache.set(id, player)

    return player
  }
}

module.exports = new OsuApi()