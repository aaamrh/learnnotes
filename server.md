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

---  

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
  
### 安装nodejs

1. 下载nodejs: `wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz`
2. 解压: `tar -xvf node-v10.15.3-linux-x64.tar.xz`]
3. 建立软连: `ln -s <路径>/bin/node /usr/local/bin/node` ( npm | npx )


### 安装git
1. `yum -y install git`
2. 第一次使用git需要设置 ssh
    1. `ssh-keygen -t rsa -b 2048 -C "your_email@example.com"`
    2. 将 `~/.ssh/id_rsa.pub` 中的秘钥添加到github中的SSH keys中。


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


