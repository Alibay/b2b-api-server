export interface IPassowrdEncoder {
  encode(password: string): Promise<string>;
}
