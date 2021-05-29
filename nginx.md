# Nginx

## Nginx 代理

``` sql
server {
  listen 80;
  root /home/vision/projects/michelin_web/static/www;
  location / {
      root /home/vision/projects/michelin_web/static/www;
      try_files $uri /index.html;
  }
  location /static/imgs {
      alias /home/vision/data/pallet_scan_template;
  }
}

```

## nginx中proxy_pass的 / 问题

    在nginx中配置proxy_pass时, 当在后面的url加上了/, 相当于是绝对根路径，则nginx不会把location中匹配的路径部分代理走;如果没有/，则会把匹配的路径部分也给代理走。

下面四种情况分别用`http://192.168.1.4/proxy/test.html`进行访问。
``` sql
-- 第一种：
location /proxy/ {
     proxy_pass http://127.0.0.1:81/;
}
会被代理到http://127.0.0.1:81/test.html 这个url

-- 第二咱(相对于第一种，最后少一个 /)
location /proxy/ {
     proxy_pass http://127.0.0.1:81;
}
-- 会被代理到 http://127.0.0.1:81/proxy/test.html 这个url

-- 第三种：
location /proxy/ {
     proxy_pass http://127.0.0.1:81/ftlynx/;
}
-- 会被代理到http://127.0.0.1:81/ftlynx/test.html 这个url。

-- 第四种情况(相对于第三种，最后少一个 / )：
location /proxy/ {
     proxy_pass http://127.0.0.1:81/ftlynx;
}
-- 会被代理到http://127.0.0.1:81/ftlynxtest.html 这个url

```

## 阿里云博客配置
``` sql
server{
    listen 80;
    server_name www.maruihua.cn;
    location / {
        root /home/marh/projects/best/client-/build;
        try_files $uri /index.html;
        index index.html;
    }
    location /api {
      rewrite  ^/api/(.*)$ /$1 break;
      proxy_pass http://127.0.0.1:3500;
    }
}

```