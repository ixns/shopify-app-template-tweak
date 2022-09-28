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

  // add a new shop
  storeActiveShop = async (data) => {
    const { shop, scope, accessToken } = data
    const query = `
      INSERT INTO active_shops (id, scope, access_token) VALUES ('${shop}', '${scope}', '${accessToken}') RETURNING *;
    `
    const updateQuery = `
      UPDATE active_shops SET access_token = '${accessToken}' WHERE id = '${shop} RETURNING *';
    `
    try {
      const exists = await this.#client.query(`SELECT * FROM active_shops WHERE id = '${shop}';`)

      if (exists.rowCount > 0) {
        // this doesnt seem to be working.
        // but also, it's not clear what the point of
        // updating the access token is..
        // code from https://github.com/j-Riv/suavescribe/blob/main/app/server/pg-store.ts
        const res = await this.#client.query(updateQuery)
        if (res.rows[0]) {
          return res.rows[0]
        } else {
          return false
        }
      } else {
        const res = await this.#client.query(query)
        if (res.rows[0]) {
          return res.rows[0]
        } else {
          return false
        }
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  // remove an active shop
  deleteActiveShop = async (name) => {
    const query = `
      DELETE FROM active_shops WHERE id = '${name}'
    `

    try {
      const res = await this.#client.query(query)
      if (res) {
        return true
      } else {
        return false
      }
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default PgStore
