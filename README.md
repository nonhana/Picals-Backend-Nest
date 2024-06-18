# Picals-Backend-Nest

[Picals-Frontend-React](https://github.com/nonhana/Picals-Frontend-React)配套的后端项目，采用的技术栈为：

Nest.js + TypeScript + TypeOrm + pm2 + MySQL + Redis。

### 项目介绍

本项目基于[Picals数据库设计文档](https://nonhana.xyz/2024/03/15/picals-about/Picals%E6%95%B0%E6%8D%AE%E5%BA%93%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/)中设计的ORM实体来进行编写，并且按照实体来对接口进行划分。

具体的接口设计，可以参考接口文档：[picals接口文档](https://picals.apifox.cn)

关于本项目的详细信息，可以查看前端项目的MD文档。

### 项目目录结构说明

经过各路调研，由于没有找到所谓 **Nest.js 项目最佳实践目录结构** 的这一说法，因此我在这个项目中按照 nest 这款框架本身的设计逻辑，以及本人的具体需求对项目结构进行组织。现阶段的大致结构如下：

```
picals-backend
├─ .eslintrc.js
├─ .gitignore
├─ .prettierrc
├─ copy.ts
├─ nest-cli.json
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
├─ scripts
│  └─ setup.sh
├─ src
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ apps
│  │  └─ 各个应用模块
│  ├─ decorators
│  │  └─ login.decorator.ts
│  ├─ email
│  │  ├─ email.module.ts
│  │  └─ email.service.ts
│  ├─ error
│  │  ├─ error.filter.ts
│  │  ├─ errorList.ts
│  │  └─ hanaError.ts
│  ├─ guards
│  │  └─ auth.guard.ts
│  ├─ img-handler
│  │  ├─ img-handler.module.ts
│  │  └─ img-handler.service.ts
│  ├─ interceptors
│  │  ├─ invoke-record.interceptor.ts
│  │  ├─ multiple-imgs-interceptor.ts
│  │  ├─ response.interceptor.ts
│  │  └─ single-img-interceptor.ts
│  ├─ main.ts
│  ├─ r2
│  │  ├─ r2.module.ts
│  │  └─ r2.service.ts
│  ├─ types
│  │  └─ express.d.ts
│  └─ utils
│     ├─ downloadFile.ts
│     ├─ index.ts
│     └─ password.ts
├─ tsconfig.build.json
└─ tsconfig.json
```

以下是一些说明：

**根目录**

- **`.eslintrc.js`**: ESLint 配置文件，用于定义代码的风格检查规则。
- **`.gitignore`**: Git 忽略文件列表，定义了哪些文件和目录不应该被 Git 版本控制。
- **`.prettierrc`**: Prettier 配置文件，用于定义代码格式化的规则。
- **`copy.ts`**: 是一个脚本文件，主要用于复制 `.env` 文件到 `dist` 目录中，确保开发环境和生产环境的配置文件相对路径一致。
- **`nest-cli.json`**: Nest CLI 的配置文件，用于定义 Nest CLI 的一些项目级别的配置。
- **`package.json`**: Node.js 项目的配置文件，列出了项目的依赖、脚本等信息。
- **`pnpm-lock.yaml`**: PNPM 包管理工具生成的锁定文件，用于锁定项目依赖的版本。
- **`README.md`**: 就是这个文件。
- **`scripts`**: 存放一些项目相关的脚本文件。
  - **`setup.sh`**: Shell 脚本，主要是用于服务器部署端对 Docker 容器的一些管理操作。
- **`tsconfig.build.json`**: TypeScript 编译配置文件，通常用于定义构建时的 TypeScript 配置。
- **`tsconfig.json`**: TypeScript 的全局配置文件，定义了 TypeScript 编译器的行为。

**`src` 目录**

- **`app.controller.ts`**: 主应用控制器，通常用于处理应用的请求和响应。**在该项目中，主要用于存放一些公共的工具接口。**

- **`app.module.ts`**: 主应用模块，定义了应用的主要模块和依赖关系。

- **`apps`**: 这里是各个应用模块的存放位置，每个应用模块可能代表一个功能子系统。
  - **`各个应用模块`**: 具体模块应该包含业务逻辑、控制器、服务等文件。每个应用模块都对应着一个实体相关的所有信息。
  
    以 user 模块举例，每一个应用模块的目录结构如下：
  
    ```
    user
    ├─ dto
    │  ├─ index.ts
    │  ├─ login-user.dto.ts
    │  ├─ register-user.dto.ts
    │  └─ update-user.dto.ts
    ├─ entities
    │  └─ user.entity.ts
    ├─ user.controller.ts
    ├─ user.module.ts
    ├─ user.service.ts
    └─ vo
       ├─ detail.vo.ts
       ├─ login.vo.ts
       └─ user-item.vo.ts
    ```
  
    - `dto` 文件夹用于定义数据传输对象，用于数据验证和传输。
    - `entities` 文件夹定义了数据库实体类，描述用户表的结构和字段。如果一个模块包含多个实体，那么需要新建多个 `entity` 。
    - `user.controller.ts` 定义了控制器，处理用户的 HTTP 请求。
    - `user.module.ts` 定义了用户模块的配置和依赖。
    - `user.service.ts` 包含了用户模块的业务逻辑和数据处理。
    - `vo` 文件夹定义了视图对象，用于统一返回给客户端的数据格式。
  
- **`decorators`**: 存放自定义装饰器的文件夹。
  
  - **`login.decorator.ts`**: 自定义的登录装饰器，可能用于在方法或类上添加登录验证逻辑。
  
- **`email`**: 电子邮件相关功能模块。
  - **`email.module.ts`**: 定义电子邮件功能模块。
  - **`email.service.ts`**: 提供电子邮件服务的业务逻辑。
  
- **`error`**: 错误处理相关的文件夹。
  
  - **`error.filter.ts`**: 全局错误过滤器，用于捕获和处理应用中的错误。
  - **`errorList.ts`**: 错误列表，可能定义了一些错误类型和信息。
  - **`hanaError.ts`**: 自定义的错误处理类或逻辑。
  
- **`guards`**: 守卫文件夹，存放用于路由保护的守卫。
  - **`auth.guard.ts`**: 鉴权守卫，通常用于保护路由，只有通过身份验证的请求才能访问。
  
- **`img-handler`**: 图像处理模块。
  - **`img-handler.module.ts`**: 图像处理功能模块。
  - **`img-handler.service.ts`**: 提供图像处理服务的业务逻辑。
  
- **`interceptors`**: 拦截器文件夹，存放各种请求或响应拦截器。
  - **`invoke-record.interceptor.ts`**: 请求调用记录拦截器，可能用于记录请求信息。
  - **`multiple-imgs-interceptor.ts`**: 处理多张图片的拦截器。
  - **`response.interceptor.ts`**: 响应拦截器，可能用于统一格式化响应数据。
  - **`single-img-interceptor.ts`**: 处理单张图片的拦截器。
  
- **`main.ts`**: 应用入口文件，通常包含启动应用的代码。

- **`r2`**: R2 相关模块，R2 可能是你们项目中一个特定的服务或功能模块。
  - **`r2.module.ts`**: R2 功能模块。
  - **`r2.service.ts`**: 提供 R2 服务的业务逻辑。
  
- **`types`**: 类型定义文件夹，存放 TypeScript 类型定义文件。
  - **`express.d.ts`**: Express 类型定义文件，可能是自定义或扩展的 Express 类型定义。
  
- **`utils`**: 工具类文件夹，存放各种工具函数。
  - **`downloadFile.ts`**: 文件下载工具函数。
  - **`index.ts`**: 工具函数的索引文件。
  - **`password.ts`**: 密码处理相关工具函数。

可见，本项目的目录结构较为清晰：

1. 与数据库相关的实体，全部放在 `apps` 内部进行统一结构管理；
2. 一些根据需求，自定义封装好的一些工具服务，新建一个模块放置于根目录下。

关于具体代码层面的落实，请直接查看仓库代码，此处不再赘述。

> ps:
>
> 由于我本人也是第一次实际的落实 nest 项目，因此肯定有很多很多的地方是值得优化的！！
>
> 如果有更好的关于该项目的一些建议，非常欢迎提 Issue 给我哦！！我 1000% 都会看到并进行回应的！！
