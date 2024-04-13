# Picals-Backend-Nest

[Picals-Frontend-React](https://github.com/nonhana/Picals-Frontend-React)配套的后端项目，采用的技术栈为：

Nest.js + TypeScript + TypeOrm + pm2 + MySQL + Redis。

## 项目介绍

本项目基于[Picals数据库设计文档](https://nonhana.xyz/2024/03/15/picals-about/Picals%E6%95%B0%E6%8D%AE%E5%BA%93%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/)中设计的ORM实体来进行编写，并且按照实体来对接口进行划分。

具体的接口设计，可以参考接口文档：[picals接口文档](https://picals.apifox.cn)

关于本项目的详细信息，可以查看前端项目的MD文档。

## 项目进度

目前本项目前端V0已经基本绘制完毕，现在开始正式的后端服务的搭建。

数据库以及实体关系已经映射完毕， **目前正在进行API接口的设计。** 

本项目的开发采用 **模块化** 的形式，也就是根据实体一个个进行设计、接口实现。

关于Nest项目的实践问题，由于我也是第一次使用该框架编写后端服务，因此有许多需要调研并且完善的地方。届时我会以issue的形式进行提出，也方便大家查看开发进度。