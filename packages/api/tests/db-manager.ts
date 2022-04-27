import { join } from 'path'

import { idGenerate } from '../src/database/models/_format/id-create'
import { knexInstanceSet } from '../src/knex'
import knex, { Knex } from 'knex'
import { Client } from 'pg'
import { knexSnakeCaseMappers, Model } from 'objection'

class DbManager {
  private readonly dbName: string
  private knexInstance = null

  public constructor() {
    this.dbName = `a${idGenerate().toLowerCase()}`
  }

  private static getPgUser() {
    return process.env.PGUSER ?? 'postgres'
  }

  private static getPgPassword() {
    return process.env.PGPASSWORD ?? 'password'
  }

  private async init(): Promise<void> {
    const globalConnection = `postgres://${DbManager.getPgUser()}:${DbManager.getPgPassword()}@localhost/postgres`
    const globalClient = new Client(globalConnection)
    await globalClient.connect()
    const queryResult = await globalClient.query(
      `SELECT 1 FROM pg_database WHERE datname='${this.dbName}'`
    )
    if (queryResult.rowCount === 0) {
      await globalClient.query(`CREATE DATABASE ${this.dbName}`)
    }
    await globalClient.end()

    this.knexInstance = this.getKnex()
    Model.knex(this.knexInstance)
    knexInstanceSet(this.knexInstance)
    await this.knexInstance.migrate.latest()
  }

  private getKnex() {
    const knexConfig = {
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        database: this.dbName,
        user: DbManager.getPgUser(),
        password: DbManager.getPgPassword()
      },
      migrations: {
        directory: [join(__dirname, '../src/knex/migrations-schema')]
      },
      seeds: {
        directory: join(__dirname, '../src/knex/seeds')
      },
      ...knexSnakeCaseMappers()
    }

    return knex(knexConfig)
  }

  public async populateDb(): Promise<Knex<any, unknown>> {
    await this.init()
    await this.injectSeed()

    return this.knexInstance
  }

  public async reseedDb(): Promise<void> {
    await this.truncateSchema()
    await this.injectSeed()
  }

  public async closeKnex(): Promise<void> {
    await this.knexInstance.destroy()
    await this.end()
  }

  private async end(): Promise<void> {
    const globalConnection = 'postgres://postgres:password@localhost/postgres'
    const globalClient = new Client(globalConnection)
    await globalClient.connect()
    await globalClient.query(`DROP DATABASE ${this.dbName}`)
    await globalClient.end()
  }

  private async injectSeed() {
    await this.knexInstance.transaction(async trx => trx.seed.run())
  }

  private async truncateSchema() {
    const tables =
      (await knex('pg_tables')
        .select('tablename')
        .where('schemaname', 'public')) ?? []

    await this.knexInstance.raw(
      `TRUNCATE TABLE "${tables
        .filter(table => table.tablename !== 'knex_migrations')
        .map(table => table.tablename)
        .join('","')}"`
    )
  }
}

const dbManager = new DbManager()

export { dbManager }
