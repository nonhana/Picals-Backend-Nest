import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { md5 } from 'src/utils';
import { hanaError } from 'src/error/hanaError';
import { UpdateUserDto, LoginUserDto } from './dto';
import { Favorite } from '../favorite/entities/favorite.entity';
import { History } from '../history/entities/history.entity';
import { PaginationService } from 'src/pagination/pagination.service';

@Injectable()
export class UserService {
  @Inject(PaginationService)
  private readonly paginationService: PaginationService;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Favorite)
  private favoriteRepository: Repository<Favorite>;

  @InjectRepository(History)
  private historyRepository: Repository<History>;

  async login(loginUserDto: LoginUserDto) {
    const foundUser = await this.userRepository.findOneBy({
      email: loginUserDto.email,
    });
    if (!foundUser) {
      throw new hanaError(10101);
    }
    if (foundUser.password !== md5(loginUserDto.password)) {
      throw new hanaError(10102);
    }
    return foundUser;
  }

  async register(email: string, password: string) {
    const foundUser = await this.userRepository.findOneBy({ email });
    if (foundUser) {
      throw new hanaError(10105);
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
      throw new hanaError(10101);
    }
    return user;
  }

  async updateUserInfo(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new hanaError(10101);
    }
    await this.userRepository.save({ id, ...updateUserDto });
    return;
  }

  async updateUserPassword(id: string, password: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new hanaError(10101);
    }
    await this.userRepository.save({
      id,
      password: md5(password),
    });
    return;
  }

  async getUserFavorites(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new hanaError(10101);
    }
    return await this.favoriteRepository.find({
      where: {
        user,
      },
    });
  }

  async getHistoryInPages(
    id: string,
    current: number,
    pageSize: number,
    order?: { [P in keyof History]?: 'ASC' | 'DESC' },
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new hanaError(10101);
    }
    return this.paginationService.paginate<History>(
      this.historyRepository,
      current,
      pageSize,
      {
        order: order || { lastTime: 'DESC' },
      },
    );
  }
}
