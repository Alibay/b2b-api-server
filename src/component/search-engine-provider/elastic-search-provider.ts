import { Client } from '@elastic/elasticsearch';
import { ISearchEngineProver } from './search-engine-prover';

export class ElasticSearchProvider implements ISearchEngineProver {

  public constructor(private readonly client: Client) {}

  public search(index: string, query: string) {
    return this.client.search({
      index,
      body: {
        query: {
          match: { hello: query },
        }
      }
    });
  }
}
