export interface ISearchEngineProver {

  search(index: string, query: string): Promise<any>;
}
