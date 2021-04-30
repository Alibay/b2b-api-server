import { ProductRepository } from '../repository/product.repository';
import { SearchService } from './search.service';

export class ProductService {

  public constructor(
    private readonly productRepository: ProductRepository,
    private readonly searchSerive: SearchService,
  ) {}
}
