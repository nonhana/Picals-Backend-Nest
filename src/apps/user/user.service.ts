import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { md5 } from 'src/utils';
import { hanaError } from 'src/error/hanaError';
import { errorMessages } from 'src/error/errorList';
import { UpdateUserDto, LoginUserDto } from './dto';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  async login(loginUserDto: LoginUserDto) {
    const foundUser = await this.userRepository.findOneBy({
      email: loginUserDto.email,
    });
    if (!foundUser) {
      throw new hanaError(10101, errorMessages.get(10101));
    }
    if (foundUser.password !== md5(loginUserDto.password)) {
      throw new hanaError(10102, errorMessages.get(10102));
    }
    return foundUser;
  }

  async register(email: string, password: string) {
    const foundUser = await this.userRepository.findOneBy({ email });
    if (foundUser) {
      throw new hanaError(10105, errorMessages.get(10105));
    }
    const user = new User();
    user.email = email;
    user.password = md5(password);
    await this.userRepository.save(user);
    return;
  }

  async getUserInfo(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new hanaError(10101, errorMessages.get(10101));
    }
    return user;
  }

  async updateUserInfo(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new hanaError(10101, errorMessages.get(10101));
    }
    await this.userRepository.save({ id, ...updateUserDto });
    return;
  }

  async updateUserPassword(id: string, password: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new hanaError(10101, errorMessages.get(10101));
    }
    await this.userRepository.save({
      id,
      password: md5(password),
    });
    return;
  }
}
