import knex, { QueryBuilder, QueryInterface } from 'knex';

export class BaseRepository<T = any> {

  constructor(
    protected readonly db: knex,
    protected readonly tableName: string,
  ) { }

  public raw(query: string) {
    return this.db.raw(query);
  }

  public rawBindings(query: string, bindings: any[]) {
    return this.db.raw(query, bindings);
  }

  public queryBuilder(): QueryInterface<any, any> {
    return this.queryWithTx(this.tableName);
  }

  public add(fields: Partial<T> | Array<Partial<T>>): QueryBuilder<any, any> {
    return this.queryWithTx(this.tableName).insert(fields);
  }

  public async upsert(fields: Partial<T> | Array<Partial<T>>) {
    const insertSql = this.add(fields).toSQL();
    const sql = `${insertSql.sql} on conflict do nothing`;

    return this.rawBindings(sql, insertSql.bindings as any[]);
  }

  public update(fields: Partial<T>): QueryBuilder<any, any> {
    return this.queryWithTx(this.tableName).update(fields);
  }

  public updateBy(fields: Partial<T>, where: Partial<T>): QueryBuilder<any, any> {
    return this.queryWithTx(this.tableName)
      .where(where)
      .update(fields);
  }

  public async get(id: number | string): Promise<T | undefined> {
    return this.queryWithTx(this.tableName)
      .where({ id })
      .first();
  }

  public getAll(where: Partial<T> = {}) {
    return this.queryWithTx(this.tableName)
      .select()
      .where(where);
  }

  public getColumns(columns: string[], where: Partial<T> = {}) {
    return this.queryWithTx(this.tableName)
      .select(columns)
      .where(where);
  }

  public getBy(where: Partial<T>) {
    return this.queryWithTx(this.tableName)
      .where(where)
      .first();
  }

  public delete(id: number | string) {
    return this.queryWithTx(this.tableName)
      .where({ id })
      .delete();
  }

  public deleteBy(where: Partial<T>) {
    return this.queryWithTx(this.tableName)
      .where(where)
      .delete();
  }

  public async exists(where: Partial<T>) {
    const row = await this.queryWithTx(this.tableName)
      .where(where)
      .first();

    return !!row;
  }

  public async existsCaseSensitive(where: Partial<T>) {
    const whereValues: any[] = Object.values(where);
    const whereConditions = Object.keys(where)
      .map(key => `${key} = ? COLLATE utf8mb4_bin`)
      .join(' AND ');

    const row = await this.queryWithTx(this.tableName)
      .whereRaw(whereConditions, whereValues)
      .first();

    return !!row;
  }

  public transaction(): Promise<knex.Transaction> {
    return this.db.transaction();
  }

  public queryWithTx(tableName: string): QueryInterface<any, any> {
    let query = this.db(tableName);
    const tx = getCurrentTx(this.db);
    if (tx) { query = query.transacting(tx); }
    return query;
  }
}

export interface ICount {
  count: number;
}

const knexClientsTxStack = new WeakMap<knex, knex.Transaction[]>();

function withTxStack<T>(knexClient: knex, fn: (stack: knex.Transaction[]) => T, write?: boolean): T {
  const txStack: knex.Transaction[] = knexClientsTxStack.get(knexClient) || [];
  const result = fn(txStack);
  if (write) {
    knexClientsTxStack.set(knexClient, txStack);
  }
  return result;
}

function pushTx(knexClient: knex, tx: knex.Transaction): void {
  withTxStack(knexClient, (txStack: knex.Transaction[]) => {
    txStack.push(tx);
  }, true);
}

function popTx(knexClient: knex): void {
  withTxStack(knexClient, (txStack: knex.Transaction[]) => {
    txStack.pop();
  }, true);
}

export function getCurrentTx(knexClient: knex): knex.Transaction | null {
  return withTxStack(knexClient, (txStack: knex.Transaction[]) => {
    return txStack[txStack.length - 1] || null;
  });
}

export async function withTx<R>(knexClient: knex, fn: (tx?: knex.Transaction) => Promise<R>): Promise<R> {

  const tx = await knexClient.transaction();
  let result: R | undefined;

  try {
    pushTx(knexClient, tx);
    result = await fn(tx);
    if (!tx.isCompleted()) { await tx.commit(); }
  } catch (e) {
    if (!tx.isCompleted()) { await tx.rollback(); }
    throw e;
  } finally {
    popTx(knexClient);
  }

  return result as R;
}
