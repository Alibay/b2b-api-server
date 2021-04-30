import { IMailProvider } from '../component/mail-provider/mail.provider';

export class MailService {

  public constructor(
    private readonly mailProvider: IMailProvider,
    private readonly from: string,
  ) {
  }

  public async sendInvite(to: string) {
    await this.mailProvider.send(this.from, to, 'subject', 'body');
  }
}
