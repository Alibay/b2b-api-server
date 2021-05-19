import { Client } from '@elastic/elasticsearch';
import config from 'config';
import { FakeProvider } from '../component/mail-provider/fake-provider';
import { BcryptPasswordEncoder } from '../component/password-encoder/bcrypt-password-encoder';
import { ElasticSearchProvider } from '../component/search-engine-provider/elastic-search-provider';

const bcryptRounds = config.get<number>('components.passwordEncoder.bcrypt.rounds');
export const passwordEncoder = new BcryptPasswordEncoder(bcryptRounds);
export const mailProvider = new FakeProvider();

const elasticSearchClient = new Client({});
export const searchEngineProvider = new ElasticSearchProvider(elasticSearchClient);
