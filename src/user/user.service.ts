import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { md5 } from 'src/utils/md5';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  @InjectRepository(User)
  private userRepository: Repository<User>;

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const user = new User();
    user.email = email;
    user.password = md5(password);
    return await this.userRepository.save(user);
  }
}
