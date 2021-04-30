import { IMailProvider } from './mail.provider';

export class MailgunProvider implements IMailProvider {

  public send(_from: string, _to: string, _subject: string, _body: string, _isHtml = false): Promise<void> {
    throw new Error('Method not implemented.');
  }

}
