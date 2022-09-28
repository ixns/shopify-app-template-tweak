import pkg from 'pg'
const { Client, QueryResult } = pkg
import dotenv from 'dotenv'

dotenv.config()

const uri = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@localhost:5432/${process.env.PG_DB}`

class PgStore {
  #client

  constructor() {
    this.#client = new Client(uri)
    this.#client.connect()
  }

  // find all active shops
  loadActiveShops = async () => {
    const query = `
      SELECT * FROM active_shops;
    `

    try {
      const reply = await this.#client.query(query)
      const shops = {}
      reply.rows.forEach((row) => {
        shops[row.id] = {
          shop: row.id,
          scope: row.scope,
          accessToken: row.access_token,
        }
      })
      return shops
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default PgStore
