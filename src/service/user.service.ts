import { IPassowrdEncoder } from '../component/password-encoder/password-encoder';
import { IUser, UserRepository } from '../repository/user.repository';
import { MailService } from './mail.service';

export class UserService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordEncoder: IPassowrdEncoder,
    private readonly mailService: MailService,
  ) {
  }

  public async create(userData: ICreateUser) {
    const dbUser = await this.userRepository.getByEmail(userData.email);
    if (dbUser) {
      throw new Error('User already exists');
    }

    const user: Partial<IUser> = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: await this.passwordEncoder.encode(userData.password),
    };

    await this.userRepository.add(user);
    await this.mailService.sendInvite(userData.email);
  }
}

interface ICreateUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
