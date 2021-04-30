import config from 'config';
import { MailService } from '../service/mail.service';
import { UserService } from '../service/user.service';
import { mailProvider, passwordEncoder } from './components';
import { userRepository } from './repositories';


const mailFrom = config.get<string>('mail.from');

export const mailService = new MailService(mailProvider, mailFrom);
export const userService = new UserService(userRepository, passwordEncoder, mailService);
