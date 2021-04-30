export interface IMailProvider {
  send(from: string, to: string, subject: string, body: string, isHtml?: boolean): Promise<void>;
}
