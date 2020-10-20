# 服务器学习笔记
> ### **安装python3**


### **1. 下载并安装python**

```bash
目录: /usr/local/py3

wget https://www.python.org/ftp/python/3.5.4/Python-3.7.1.tgz
```

    yum install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gcc make 

    不能忽略相关包，我之前就没有安装readline-devel导致执行python模式无法使用键盘的上下左右键
    
***wget、yum、rpm、apt-get 区别***

`wget` 类似于迅雷，是一种下载工具

`yum`  是redhat, centos 系统下的软件安装方式，基于Linux

`rpm`  软件管理;   redhat的软件格式 rpm
r=redhat  p=package   m=management, 用于安装 卸载 .rpm软件

`apt-get` 是ubuntu下的一个软件安装方式，基于debain。

------  

```bash
    tar -cvf Python-3.5.4.tgz  // 生成 Python-3.7.1 文件夹
    cd Python-3.7.1
    ./configure --prefix=/usr/local/py3
    make && make install 

    添加软链到执行目录下/usr/bin
    ln -s /usr/local/python3/bin/python3 /usr/bin/python

    yum是依赖python的，所以:
    /usr/bin/yum
    /usr/libexec/urlgrabber-ext-down
    将第一行"#!/usr/bin/python" 改为 "#!/usr/bin/python2"即可。

    下载miniconda
    wget https://repo.continuum.io/miniconda/Miniconda3-4.5.11-Linux-x86_64.sh
    
    安装后在miniconda在 /root/ 目录下
    刚安装完毕，命令conda还不能用, 需要在root目录下执行: source .bashrc。
    每次修改.bashrc后，使用source ~/.bashrc（或者 . ~/.bashrc）就可以立刻加载修改后的设置，使之生效。
```


    configure --prefix=/usr/local/py3

    编译的时候用来指定程序存放路径
    不指定prefix, 可执行文件默认放在/usr/local/bin, 库文件默认放在/usr/local/lib, 配置文件默认放在/usr/local/etc。其它的资源文件放在/usr/local/share。

***tar***

`tar -xvf`
- -x 解压文件
- -v 显示详细的tar处理的文件信息
- -f 要操作的文件名
- -c 创建新的文档
- -r 表示增加文件，把要增加的文件追加在压缩文件的末尾
- -t 表示查看文件，查看文件中的文件内容
- -z 调用gzip程序来压缩文件，压缩后的文件名称以.gz结尾。
  

--------------  
### 安装nodejs
1. 下载nodejs: `wget https://nodejs.org/dist/v12.14.0/node-v12.14.0-linux-x64.tar.xz`
2. 解压: `tar -xvf node-v12.14.0-linux-x64.tar.xz`]
3. 建立软连: `ln -s <路径>/bin/node /usr/local/bin/node` ( npm | npx )
    #### npm 全局安装成功后，执行命令报错
    > linux中，`npm install forever -g` 全局安装pm2后，执行 pm2 提示 `-bash: forever: command not found`
    1. npm install forever -g
    
        完成后截图：
        ![阿里云安全组配置](https://github.com/aaamrh/learnnotes/blob/master/images/service/node-path1.png)

    2. 安装完成后，在控制台输入 forever 提示 `-bash: forever: command not found`
    3. 添加环境变量
        
        执行命令 `vim /etc/profile`
        ![添加环境变量](https://github.com/aaamrh/learnnotes/blob/master/images/service/node-path2.png)

    4. 修改后保存，更新配置文件`source /etc/profile`, 大功告成 ！！！


-----------
### 安装git
1. `yum -y install git`
2. 第一次使用git需要设置 ssh
    1. `ssh-keygen -t rsa -b 2048 -C "your_email@example.com"`
    2. 将 `~/.ssh/id_rsa.pub` 中的秘钥添加到github中的SSH keys中。


----------
### Nginx
1. 启动: `cd /usr/local/nginx/sbin` ,    `./nginx`
2. 查看运行状态: `ps aux|grep nginx`
3. 停止服务
   1. 立即停止服务: `./nginx -s stop`
   2. 从容停止服务: `./nginx -s quit` (当前工作任务完成后再停止)
   3. kill 或 killall杀死进程: `kill PID` , `killall Nginx`
   4. 重启nginx: `nginx -s reload`
4. nginx 启动后会监听80端口,如果被占用会启动失败 `netstat -tlnp`查看端口占用情况
5. 访问测试：默认情况下，CentOS开启了iptables防火墙，要让其他浏览器访问web服务器, 需要配置iptables防火墙, 开放80端口：`iptables -I INPUT -p tcp --dport 80 -j ACCEPT`, `service iptables status`查看防火墙状态。
   1. `-I INPUT` 表示在INPUT(外部访问规则)中插入一条规则
   2. `-p tcp` 指定数据包匹配的协议(tcp, udp, icmp等), 这里是tcp
   3. `--dport 80` 指定数据包匹配的目标端口号
   4. `-j ACCEPT` 制定对数据包的处理操作(ACCEPT, REJECT, DROP, REDIRECT等)
   5. 上述操作只是临时生效，并未保存，在系统重启或iptables服务重启后会恢复原来的规则， 可以使用 `service iptables save`保存服务
   6. `service iptables restart`

`阿里云服务器有自己的安全规则，如上配置好后只能内网ping通，外网不能ping通，需在案例云安全组配置中添加规则`

![阿里云安全组配置](https://github.com/aaamrh/learnnotes/blob/master/images/service/%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%89%E5%85%A8%E7%BB%84%E9%85%8D%E7%BD%AE.png)


------------------
### 安装配置mongodb
1. 新建文件： `touch /etc/yum.repos.d/mongodb-org-4.0.repo` 更多见：[Mongodb其他版本安装教程](https://docs.mongodb.com/manual/administration/install-on-linux/)
```
    [mongodb-org-4.0]
    name=MongoDB Repository
    baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.0/x86_64/
    gpgcheck=1
    enabled=1
    gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc
```
2. 安装 `sudo yum install -y mongodb-org`
3. 服务管理 (我执行下面命令没效果，目前还没有解决)
   1. `service mongod start` #启动 
   2. `service mongod stop` #停止 
   3. `service mongod restart` #重启
4. 启动服务 `mongod -f /etc/mongod.conf` 或 `mongod –fork –dbpath [dbpath] –logpath [logpath]`。 [mongod参数选项](https://blog.csdn.net/xqzhang8/article/details/72588278)

usr/bin/mongod --fork --dbpath=/var/lib/mongodb --logpath=/var/log/mongodb/mongo.log --logappend // fork是后台运行

5. 关闭后台运行
   1. `mongo`
   2. `use admin`
   3. `db.shutdownServer()`  或者 `db.adminCommand( { shutdown: 1 } )`
6. 创建用户后登录方式： `mongo --port 27017`, `use database` , `db.auth('marh', '123123')`
7. 卸载 `sudo yum erase $(rpm -qa | grep mongodb-org)`
8. 数据库迁移
   1. 导出数据 `mongoexport -d dbname -c collectionname -o filepath --type json/csv -f field `
      * -d：数据库名 -c：集合名称 -o : 导出数据文件的路径 -type : 导出数据类型，默认json
   2. 导入数据 `mongoimport -d dbname -c collectionname --file filename --headerline --type json/csv -f field --authenticationDatabase admin`
      * -d：数据库名 -c：集合名称 --file : 选择导入的文件 -type : 文件类型，默认json -f : 字段，type为csv是必须设置此项

```
	use admin
 
	# 创建管理员用户，并指定其权限。
	db.createUser({
	  user : 'root',
	  pwd : '123456',
	  roles : [
		'clusterAdmin',
		'dbAdminAnyDatabase',
		'userAdminAnyDatabase',
		'readWriteAnyDatabase'
	  ]
	})
	
	# 重启MongoDB服务并加上--auth参数
	# ./mongod --dbpath=/data/db/mongo/ --logpath=/data/db/mongo/log --logappend  --port=27017 --fork --auth
	
	
	# 创建用户。
	db.createUser({
		"user":"",
		"pwd":"",
		roles:[
			{"role":"readWrite", "db":"maBlog"}
		]
	})

```


### `CentOS7 npm全局安装成功，使用提示 Command not found`
1.  `mkdir ~/.npm-global`
2.  设置npm用新目录路径: `npm config set prefix '~/.npm-global'`
3. 打开或创建 `~/.profile`, 添加：`export PATH=~/.npm-global/bin:$PATH`
4.  刷新系统变量： `source ~/.profile`
5.  `npm install -g jshint`  全局安装后可以使用了，大功告成~~


### 使用forever让nodejs后台运行
> * `npm install forever -g`
> * `forever start app.js` #启动 app.js 
> * `forever stop app.js` #关闭 app.js  

------

## nginx React 在服务器上的配置
``` nginx
    
    server{
        listen 80;
        server_name www.maruihua.cn;
        location / {
            root /home/marh/projects/react-flask/build;
            try_files $uri /index.html;      # 解决页面访问不到react路由的问题
            index index.html;
        }
        location /api {
            rewrite  ^/api/(.*)$ /$1 break;  # 开发时, react 一般会在前面添加 /api 前缀, 需要用正则去掉, 否则后台也要添加 /api 前缀
            proxy_pass http://127.0.0.1:5000;
        }
}
```

``` js
    // setupProxy.js
    const { createProxyMiddleware } = require('http-proxy-middleware');
    module.exports = function(app) {
        app.use(
            createProxyMiddleware('/api',
                {
                    target: 'http://127.0.0.1:5000',
                    changeOrigin: true,
                    pathRewrite: {
                    '/api': '',    // 后台不需要添加 /api
                    }
                }
            )
        );
    };

    // xxx.js
     axios({
      method:'get',
      url:'/api/haha',   // 实际请求的时 /haha
    })
    .then(function (response) { console.log(response) });
```
    
------
# 知识点
### **centOS7防火墙：iptables**
> 是centos7 默认使用的防火墙是Firewall，要先把Firewall 关闭再使用iptables
#### 0x01介绍
iptables命令是Linux上常用的防火墙软件，是netfilter项目的一部分
iptables文件设置路径：命令：vim /etc/sysconfig/iptables-config

#### 0x02注意事项
关闭Firewall 命令
命令：systemctl stop firewalld #关闭防火墙
命令：systemctl disable firewalld #禁止开机启动

#### 0x03检查是否安装了iptables
命令：service iptables status
#### 0x04安装iptables
命令：yum install -y iptables
#### 0x05升级iptables
命令：yum update iptables
#### 0x06安装iptables-services
命令：yum install iptables-services
#### 0x07开启防火墙
命令：systemctl start iptables.service #启动防火墙
命令：systemctl enable iptables.service #设置开机自启动
#### 0x08关闭防火墙
命令：systemctl stop iptables.service     #关闭防火墙
命令：systemctl disable iptables.service   #禁止开机启动
#### 0x09查看iptables状态
命令：systemctl status iptables.service
#### 0x10查看iptables现有规则
命令：iptables -L -n
#### 0x11重点：清除默认的防火墙规则
1. 安装完成基本配置-允许所有请求防止悲剧。首先在清除前要将policy INPUT改成ACCEPT,表示接受一切请求。这个一定要先做，不然清空后可能会直接悲剧
设置 INPUT 方向所有的请求都允许
命令：iptables -P INPUT ACCEPT
2. 安装完成基本配置-清空所有默认规则
命令：iptables -F
3. 安装完成基本配置-清空所有自定义规则
命令：iptables -X
4. 安装完成基本配置-所有计数器归0
命令：iptables -Z
#### 0x12重点：配置规则
1. 允许来自于lo接口的数据包
如果没有此规则，你将不能通过127.0.0.1访问本地服务，例如ping 127.0.0.1
命令：`iptables -A INPUT -i lo -j ACCEPT`
2. 开启某个端口: `iptables -A INPUT -p tcp --dport 端口 -j ACCEPT`
3. 允许icmp包通过,也就是允许ping。命令：`iptables -A INPUT -p icmp -m icmp --icmp-type 8 -j ACCEPT`
4. 允许所有对外请求的返回包
本机对外请求相当于OUTPUT,对于返回数据包必须要接收啊，这相当于INPUT了
命令：`iptables -A INPUT -m state --state ESTABLISHED -j ACCEPT`
5. 如果要添加内网ip信任（接受其所有TCP请求）
`iptables -A INPUT -p tcp -s 192.168.1.50(改为允许的内网IP即可) -j ACCEPT`
6. 过滤除iptables规则之外的所有请求
命令：`iptables -P INPUT DROP`
#### 0x13 重点：保存规则
注意：设置完成以后先执行命令iptables -L -n看一下配置是否正确。
没问题后，先不要急着保存，因为没保存只是当前有效，重启后就不生效，这样万一有什么问题，可以后台强制重启服务器恢复设置。
另外开一个ssh连接，确保可以登陆。
确保没问题之后在进行保存
保存命令：service iptables save
#### 0x14 重启防火墙
systemctl restart iptables.service
#### 0x15 杂项
15.1要封停一个IP，使用下面这条命令
命令：iptables -I INPUT -s ... -j DROP
15.2 要解封一个IP，使用下面这条命令
命令：iptables -D INPUT -s ... -j DROP
#### 0x16 删除某个已有规则
要删除规则那么我们就需要先将所有iptables规则以序号标记显示，执行：
命令：iptables -L -n --line-numbers
比如要删除INPUT里序号为8的规则，执行：
命令：iptables -D INPUT 8




