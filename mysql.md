# mysql

## MySQL 8.0登录验证方式

``` shell
#由于 MySQL 8.0 使用了新的登录验证方式 caching_sha2_password 代替旧的 mysql_native_password， 导致使用 MySQL 8.0前的客户端在连接 MySQL 8.0服务器时出现标题 Authentication plugin 'caching_sha2_password' cannot be loaded 的错误，解决方法如下：


ALTER USER 'root'@'localhost' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER; #修改加密规则 
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; #更新一下用户密码 
FLUSH PRIVILEGES; #刷新权限 
```

## 数据库命令

``` sql
alter table 表名 modify column 表字段 类型; -- 转换表的类型

```