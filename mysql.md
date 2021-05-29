# mysql

## MySQL 8.0登录验证方式

``` sql
 --由于 MySQL 8.0 使用了新的登录验证方式 caching_sha2_password 代替旧的 mysql_native_password， 导致使用 MySQL 8.0前的客户端在连接 MySQL 8.0服务器时出现标题 Authentication plugin 'caching_sha2_password' cannot be loaded 的错误，解决方法如下：


ALTER USER 'root'@'localhost' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER; -- 修改加密规则 

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';  --更新一下用户密码 

FLUSH PRIVILEGES;  --刷新权限 
```

## 链接数据库出现的错误

``` sql
    -- mysql8.0 版本之后1130解决方案
    CREATE USER 'marh'@'%' IDENTIFIED BY 'password';

    GRANT ALL PRIVILEGES ON *.* TO 'marh'@'%' WITH GRANT OPTION;

    -- mysql8.0之前
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '密码' WITH GRANT OPTION;

    flush privileges;

    -- mysql8 之前的版本中加密规则是mysql_native_password,而在mysql8之后,加密规则是caching_sha2_password
    use mysql;
    
    ALTER USER 'root'@'localhost' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER; -- 更改加密方式

    ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; -- 更新用户密码

    FLUSH PRIVILEGES; -- 刷新权限
```

## 数据库命令

``` sql
alter table 表名 modify column 表字段 类型; -- 转换表的类型

```
