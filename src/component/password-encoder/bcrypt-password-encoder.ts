import bcrypt from 'bcrypt';
import { IPassowrdEncoder } from './password-encoder';

export class BcryptPasswordEncoder implements IPassowrdEncoder {

  public constructor(private readonly rounds: number) {}

  public encode(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  public verify(plain: string, encoded: string): Promise<boolean> {
    return bcrypt.compare(plain, encoded);
  }
}
