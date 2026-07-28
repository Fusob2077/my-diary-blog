# 部署说明

本仓库是个人站源码参考，部署路径与域名请按你自己的环境替换。

## 环境变量

复制 `.env.example` 为 `.env.local`（本地）或在服务器上创建 `.env.production`：

```bash
cp .env.example .env.local
```

填入自己的 Supabase URL 与 anon key。**不要提交真实密钥。**

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。

## Vercel（可选）

1. 导入本仓库  
2. 在 Project Settings → Environment Variables 填入与 `.env.example` 相同的两项  
3. 部署

## Ubuntu + Nginx + PM2（自建）

### 1. 安装运行时

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
```

### 2. 拉取并构建

```bash
sudo mkdir -p /var/www
cd /var/www
git clone <你的仓库地址> my-diary
cd my-diary
cp .env.example .env.production
nano .env.production   # 填入 Supabase 配置

npm install
npm run build
pm2 start npm --name "my-diary" -- start
pm2 save
pm2 startup
```

也可使用仓库根目录的 `deploy.sh` 在服务器上更新：

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Nginx 反代

```nginx
server {
    listen 80;
    server_name your.domain.or.ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/my-diary /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

更完整的 Nginx / PM2 说明见上文；仓库根目录另有 `deploy.sh` 用于服务器上更新构建。

## 数据库

见 [`supabase/README.md`](../supabase/README.md)。
