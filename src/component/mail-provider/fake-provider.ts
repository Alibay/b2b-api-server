import { Logger } from 'pino';
import { getLogger } from '../../context';
import { IMailProvider } from './mail-provider';

export class FakeProvider implements IMailProvider {

  private readonly logger: Logger;

  public constructor() {
    this.logger = getLogger('Fake Mail Provider');
  }

  public async send(from: string, to: string, subject: string, body: string, isHtml = false): Promise<void> {
    this.logger.debug({ from, to, subject, body, isHtml }, 'Pretending to send an email');
  }

}
