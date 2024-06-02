#!/usr/bin/env bash
#image_version=`date +%Y%m%d%H%M`;

# 关闭容器
docker-compose stop || true;
# 删除容器
docker-compose down || true;
# 构建镜像
docker-compose build;
# 启动并后台运行
docker-compose up -d;
# 查看日志
docker logs nodejs;
# 对空间进行自动清理
docker system prune -a -f