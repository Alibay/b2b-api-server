import { ISearchEngineProver } from '../component/search-engine-provider/search-engine-prover';

export class SearchService {

  public constructor(private readonly searchEngine: ISearchEngineProver) {
  }

  public searchProduct(query: string) {
    return this.searchEngine.search(SearchIndex.Porduct, query);
  }
}

enum SearchIndex {
  Porduct = 'product',
  Route = 'route',
}
