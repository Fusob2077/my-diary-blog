# my-diary

个人数字档案馆 / 日记站源码。**高度客制化**，按我自己的栏目、视觉与工作流写的，不是通用博客模板。

> 定位：**personal site reference / showcase**  
> 适合：看结构、抄某块实现、当学习样本  
> 不适合：期望 clone 后一键变成「你的博客」

导航里的梦日记、哲学、ACG、嵌入式、法文装饰文案等，都是个人需求，fork 后大概率要大改。

## 技术栈

- Next.js（App Router）+ React + TypeScript + Tailwind CSS
- Supabase（Postgres + Auth + RLS）
- 部分动效：Framer Motion / anime.js / tsparticles

## 本地运行

1. 准备一个 [Supabase](https://supabase.com) 项目  
2. 按 [`supabase/README.md`](./supabase/README.md) 执行 SQL（先 `00-core-tables.sql`，再其余 schema / 可选 seed）  
3. 在 Supabase Auth 创建管理员邮箱账号  
4. 配置环境变量：

```bash
cp .env.example .env.local
# 填入 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
```

5. 安装并启动：

```bash
npm install
npm run dev
```

## 仓库里有什么 / 没有什么

| 有 | 没有 |
|---|---|
| 页面与交互代码 | 真实日记、私密正文（在你自己的 DB 里） |
| Schema SQL + 可选分类 seed | `.env` / 密钥 |
| 部署说明 | 通用主题/插件系统 |

## 文档

- [Schema 说明](./supabase/README.md)
- [部署说明](./docs/DEPLOY.md)

## 开源方式

MIT。可以随意 fork、改、用于自己的项目。  
若发基于本仓库的衍生项目，欢迎在 README 里提一句参考来源，非强制。

**安全提醒：** 切勿把 `.env`、service role key、或含隐私的 dump 推进公开仓库。Anon key 也应只用你自己项目的；若曾把密钥写进测试脚本，请在 Supabase 控制台轮换。

## License

[MIT](./LICENSE)
