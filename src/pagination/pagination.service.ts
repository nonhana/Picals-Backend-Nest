import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';

export interface IPaginationResult<T> {
  result: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class PaginationService {
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  async getOrSetCache(
    key: string,
    fetchFunction: () => Promise<number>,
  ): Promise<number> {
    let value = await this.cacheManager.get<number>(key);
    if (value === null) {
      value = await fetchFunction();
      await this.cacheManager.set(key, value, 1000 * 60 * 5); // 缓存5分钟
    }
    return value;
  }

  async paginate<T>(
    repo: Repository<T>,
    page: number = 1,
    limit: number = 10,
    options?: Partial<{
      where: any;
      order: { [P in keyof T]?: 'ASC' | 'DESC' };
    }>,
  ): Promise<IPaginationResult<T>> {
    const skippedItems = (page - 1) * limit;

    const queryBuilder = repo.createQueryBuilder();
    queryBuilder.limit(limit);
    queryBuilder.offset(skippedItems);

    if (options && options.where) {
      queryBuilder.where(options.where);
    }

    if (options && options.order) {
      queryBuilder.orderBy(options.order);
    }

    const cacheKey = `total-${repo.metadata.name}-${JSON.stringify(options)}`;
    const total = await this.getOrSetCache(cacheKey, () =>
      queryBuilder.getCount(),
    );

    const result = await queryBuilder.getMany();

    return {
      result,
      total,
      page,
      limit,
    };
  }
}
