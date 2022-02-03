# Flask 捯饬笔记

> 小命令
> - `pip install --update <包名称>`  更新包
> - `pipenv install` 创建虚拟环境
> - `pipenv shell` 激活虚拟环境
> - `pipenv graph` 查看当前环境下的依赖情况
> - `pipenv run flask run | flask run` (没进虚拟环境 | 进了虚拟环境) 用当前虚拟环境运行程序 eg: pipenv run python

---
### 搭建开发环境
1. ` pip install pipenv`
2. `pipenv install` 创建虚拟环境，这会为当前项目创建一个文件夹，其中包含隔离的Python解释器环
境，并且安装pip、wheel、setuptools等基本的包。
3. `pipenv shell` 命令显式地激活虚拟环境, 当执行pipenv shell或pipenv run命令时， Pipenv会自动从项目目录下
的.env文件中加载环境变量。
4. `pipenv install flask`
5. `pipenv update flask`
6. `pipenv run flask run | flask run`
7. `pipenv install python-dotenv` 管理环境变量,在项目根目录下分别创建两个文件： .env和.flaskenv


---
#### 管理环境变量

    FLASK_APP=hello/hello
    FLASK_RUN_PORT=6666
    FLASK_RUN_HOST=0.0.0.0
    FLASK_ENV=development
    FLASK_DEBUG=1   ( 1开启, 0关闭 )

#### 项目配置
    // 配置的名称必须是全大写形式，小写的变量将不会被读取。
    app.config['ADMIN_NAME'] = 'Peter'  

    // 使用update()方法则可以一次加载多个值：
    app.config.update(
        TESTING=True,
        SECRET_KEY='_5#yF4Q8z\n\xec]/'
    )
#### request
``` python
form flask import request

# 接收url中的参数
@app.route("/req")
def req():
    print(request.method) #获取访问方式 GET
    print(request.url) #获取url http://127.0.0.1:5000/req?id=1&name=wl
    print(request.cookies) #获取cookies {}
    print(request.path)  # 获取访问路径 /req
    print(request.args) #获取url传过来的值  ImmutableMultiDict([('id', '1'), ('name', 'wl')])
    print(request.args.get("id")) #get获取id  1
    print(request.args["name"]) # 索引获取name wl
    print(request.args.to_dict()) # 获取到一个字典 {'id': '1', 'name': 'wl'}

    # request 获取url
    # 通过发送 GET 到 http://127.0.0.1:5000/test/a?x=1，
    print(request.path)  # /test/a
    print(request.host)  #: 127.0.0.1:5000
    print(request.host_url)  #: http://127.0.0.1:5000/
    print(request.full_path)   #: /test/a?x=1
    print(request.script_root)   #: 
    print(request.url)   #: http://127.0.0.1:5000/test/a?x=1
    print(request.base_url)   #: http://127.0.0.1:5000/test/a
    print(request.url_root)   #: http://127.0.0.1:5000/

    return "Hello"

# 接收 form 表单参数
@app.route("/login",methods=["POST","GET"])
def login():
    print(request.form) # 格式 ImmutableMultiDict([('username', '123'), ('pwd', '123')])
    print(request.form.to_dict()) # 格式 {'username': '123', 'pwd': '123'}
    print(request.form['data'])
    print(request.form.getlist('checkbox')) # 获取checkbox的数据要用getlist

    request.form.get("key", type=str, default=None) # 获取表单数据

    request.args.get("key") # 获取get请求参数
    request.values.get("key") # 获取所有参数


# 上传文件
@app.route("/login", methods=["POST", "GET"])
def login():
    my_file = request.files.get("my_file")  # 格式 ImmutableMultiDict([('my_file', <FileStorage: 'Chrysanthemum.jpg' ('image/jpeg')>)])
    # f = request.files['file']

    # if not os.path.exists(dir_name):
    #   os.makedirs(dir_name, 755)
    
    file_path = os.path.join("static", "1.jpg")
    my_file.save(file_path)

# 接收 json
@app.route("/login", methods=["POST", "GET"])
def login():
   
    print(request.data) # 存放的是请求体中的原始信息 Content-Type:无法识别的类型
    print(request.json) # 请求头中存在 Content-Type:application/json 将请求体中的数据 存放在JSON中
    print(request.values) # CombinedMultiDict([ImmutableMultiDict([]), ImmutableMultiDict([('username', '123'), ('pwd', '123'), ('my_file', '')])])
    print(request.values.to_dict()) # 这是个坑!!!{'username': '123', 'pwd': '123', 'my_file': ''}
    print(request.get_data())
    print(request.get_json())

```

### 获取 url

``` python
# request 获取url
测试了一下：通过发送 GET 到 http://127.0.0.1:5000/test/a?x=1，

# request.path: /test/a
# request.host: 127.0.0.1:5000
# request.host_url: http://127.0.0.1:5000/
# request.full_path: /test/a?x=1
# request.script_root: 
# request.url: http://127.0.0.1:5000/test/a?x=1
# request.base_url: http://127.0.0.1:5000/test/a
# request.url_root: http://127.0.0.1:5000/
```

### 下载文件

``` python
    # 普通下载文件方式
    @app.route('/export_csv/')
        def export_csv():
        print('--------------')
        f =  os.path.dirname(__file__)[0],  

        print(f)

        return send_from_directory(f, filename='推荐理财.docx', as_attachment=True)
        # as_attachment=True 一定要写，不然会变成打开，而不是下载

    # 流式读取
    from flask import Response

    def export_csv():
        def send_file():
            with open(url, 'rb') as f:
            while 1:
                data = f.read(20 * 1024 * 1024)   # 每次读取20M
                if not data:
                break
                yield data

    response = Response(send_file(), content_type='application/octet-stream')
    response.headers["Content-disposition"] = 'attachment; filename=%s' % '推荐理财.docx'.encode("utf-8").decode("latin1")  # 如果不加上这行代码，导致没有文件名，和文件格式

    return response
```
**涉及到的错误：** `UnicodeEncodeError: 'latin-1' codec can't encode characters in position 42-45: ordinal not in range(256)`
**起因：** 发现文件名有中文名字，　所以导致错误，　编码是latin-1编码， 所以我们需要解码成unicode在编码成latin-1
**解决：** '推荐理财.docx'.encode("utf-8").decode("latin1")


### 获取前台GET的数据
    url: http://localhost:5000/hello?name=Grey

    // 第二个参数是默认值
    name = request.args.get('name', 'Flask')

### 获取前台POST的数据
``` python 
    # post 请求 (Content-Type: application/json，)
    # 1.获取未经处理过的原始数据而不管内容类型,如果数据格式是json的，则取得的是json字符串，排序和请求参数一致
    c = request.get_data()    
    # 2.将请求参数做了处理，得到的是字典格式的，因此排序会打乱依据字典排序规则
    c = request.get_json()
    # 3.可以获取未经处理过的原始数据，如果数据格式是json的，则取得的是json字符串，排序和请求参数一致
    c = request.data
    # 4.将请求参数做了处理，得到的是字典格式的，因此排序会打乱依据字典排序规则
    c = request.json
    # ps： 刚开始使用的时候以为是一个方法这样调用request.json()然后报错如下：
    #      Content-Type: application/json时报错'dict' object is not callable
    #      原来是个属性，因此这样使用request.json,就能正常使用了
    #  
    # 我个人做flask取post请求参数一般都是这样用：
    a = request.json['a']

```

#### URL处理
    url转换器 <转化器：变量名>
    /article/<int: id>

#### make_response()

```python
    # 返回内容:
    response = make_response('<h2>羞羞哒</h2>')
    return response, 404

    # 返回页面
    temp = render_template('hello.html')
    response = make_response(temp)
    return response

    #redirect 跳转
    response = make_response(redirect(url_for('greet',name='haha')))
    response.mimetype = 'text/plain'
    response.set_cookie('name', name, max_age=10)
    return response

    # response 对象方法：headers status status_code mimetype set_cookie()

    # set_cookie()其他参数
    # max_age: cookie被保存的时间， 单位是 s，默认关闭浏览器过期
    # expires 具体的过期时间, datetimed对象
    # domain 设置cookiek可用的域名
    # httponly 设置为True,禁止客户端 JS 获取 cookie
    
```

### 自定义上下文：context_processor上下文处理器

> 如果多个模板都需要使用同一变量， 那么比起在多个视图函数中重复传入， 更好的方法是能够设置一个模板全局变量。 Flask提供了一个`app.context_processor`装饰器，

```python
    @app.context_processor
    def inject_foo():
        foo = 'I am foo.'
        bar = 'I am bar.'
        return dict(foo=foo,bar=bar)

    # 1.html
    {{foo}}
    {{bar}}

    # 2.html
    {{foo}}
    {{bar}}
```

### 自定义全局函数
```python
    @app.template_global()
    def Global(a,b,c):
        return a + b + c

    # 1.html
    # <p>全局函数global: {{ Global(1,4,5) }} </p>
```

### 自定义过滤器
```python
    @app.template_filter()
    def musical(s):
        return "hello" + s
    
    使用: {{ name|musical }}
```

### 模板继承
```python
    # base.html
    {% block content %} {% endblock %}

    # use-base.html
    {% extends 'base.html' %}

    {% block content %}
        {{ super() }}               # 追加内容
        <h1>use base.html</h1>
    {% endblock %}
```

### 消息闪现
``` python
    @app.route('/flash/')
    def just_flash():
        flash(u'这是flask的闪现')
        return redirect(url_for('base'))

    # 在html中，需要用get_flash_message 获取消息
    {% for message in get_flashed_messages() %}
        {{ message }}
    {% endfor %}

    # flash()函数发送的消息会存储在session中
    # get_flashed_message()函数被调用时，session中存储的所有消息都会被移除
```

### 404 页面
``` python
    # 错误函数处理需要附加 app.errorhandler()装饰器
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404
```

### 链接数据库
``` python
    # 安装 pip install pymysql flask-sqlalchemy
    import pymysql
    from flask_sqlalchemy import SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://username:pwd@host/dbname')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
```

### flask-sqlalchemy

``` python
    # 创建模型
    class Users(db.Model):
        id = db.Column(db.Integer, primary_key = True)
        uname = db.Column(db.String(20), unique=True, nullable=False)
        
```

### Session

``` python
    from flask import session
        
    # 设置session
    session['username'] = 'aaamrh'

    # 读取session
    result = session[‘key’]     # 如果内容不存在，将会报异常
    result = session.get(‘key’) # 如果内容不存在，将返回None
        
    # 删除session
    session.pop('username')
        
    # 清除session中的所有数据
    session.clear()
        
    # 设置session的过期时间
    # 如果没有指定session的过期时间，那么默认是浏览器关闭后就自动结束
    # 如果设置了session的permanent属性为True，那么过期时间是31天。
    session.permanent = True
        
    # 设置有效期限
    from datetime import timedelta
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7) # 配置7天有效 
    app.permanent_session_lifetime = timedelta(minutes=10)       # 10分钟有效期

```

### python shell CURD

```python

    from app import db, Note

    from sqlalchemy import or_, and_
    # Create
    note = Note(body='Are these your keys?')
    db.session.add(note)
    db.session.commit()

    # Read
    # 执行sql语句
    sql = 'select * from note'
    res = db.session.execute(sql)

    Note.query.all()
    Note.query.first()
    Note.query.get(id)
    Note.query.count()
    Note.query.filter_by(body='hello').first()
    Note.query.filter(Note.body='hello').first()
    Note.query.filter(Note.body.like('%hello%'))              # LIKE
    Note.query.filter(Note.body.in_(['bar', 'foo', 'baz']))   # IN
    Note.query.filter(-Note.body.in_(['foo','bar']))          # NOT IN

    Note.query.filter(and_(Note.body=='foo', Note.title =='2019')) # AND
    # 或者
    Note.query.filter(Note.body=='foo',Note.tite =='2019')
    # 或者
    Note.query.filter(Note.body=='foo').filter(Note.title=='2019')

    Note.query.filter(or_(Note.body=='foo', Note.body=='bar'))    # OR

    # 当想查询某字段!=''的数据时, 用filter()
    # Task.query.filter_by(user_id=1, result='').all()
    Task.query.filter(Task.user_id==1, Task.result!='').all()

    # Update
    note = Note.query.get(2)
    note.body = 'update'
    db.session.commit()

    # delete
    note = Note.query.get(2)
    db.session.delete(note)
    db.session.commit()

    # filter_by 比 filter 更易于使用
    Note.query.filter_by(body='SHAVE').first()
```

### 在视图函数里操作数据库
```python

    # Create
    body = form.body.data
    note = Note(body=body)
    db.session.add(note)
    db.session.commit()

    # Read
    form = DeleteForm()
    notes = Note.query.all()

    # Update
    form = EditNoteForm()
    note = Note.query.get(note_id)
    if form.validate_on_submit():
        note.body = form.body.data
        db.session.commit()
        flash('Your note is updated.')
        return redirect(url_for('index'))
    form.body.data = note.body

    # Delete
    note = Note.query.get(note_id)
    db.session.delete(note)
    db.session.commit()
```

### 执行mysql语句
```python
from sqlalchemy import create_engine

engine = create_engine('mysql+pymysql://root:qingtongsrv1@192.168.11.18:3306/zwy')
db_session = scoped_session(sessionmaker(bind=engine))
s = db_session()

sql = "select * from wx_user where wx_id='{0}'".format(user_id)
if s.execute(sql).fetchone(): return ''


sql = "INSERT INTO wx_user (wx_id, nick_name, province, city) VALUES ('{0}','{1}','{2}','{3}')"
sql = sql.format( user_id, user_info['nickName'], user_info['province'], user_info['city'] )
s.execute(sql)
s.commit()

# 或者
from sqlalchemy import text
result = db.execute(text('select * from table where id < :id and typeName=:type'), {'id': 2,'type':'USER_TABLE'})
```

-------
### WebSocket
``` python 
    # pip install Flask-SocketIO
    # 注意：不可用在开发环境 development
    # app.py
    from flask import Flask, render_template
    from flask_socketio import SocketIO, emit

    socketio = SocketIO()

    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret string'
    socketio.init_app(app, cors_allowed_origins="*") # 解决跨域问题

    @app.route('/')
    def index():
    return render_template('index.html')


    @socketio.on('new message')
    def new_message(message_body):
        print(message_body)
        emit('aaa', '我是服务器aaa的数据')


    # 在 flask 路由中用 socketio.emit 发送数据
    @app.route('/hello')
    def hello():
        socketio.emit('hello', 'data')

```

``` html
    <!-- index.html -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
    <script>
        var socket = io();
        
        setInterval(function(){
            socket.emit('new message', 'hahahahahahah');
        }, 1000)

        socket.on('aaa', function(data){
            console.log(data)
        })
    </script>
```
------

### flask-migrate 迁移数据库修改字段没变化

``` python
#最近在开发过程中遇到了需要将string类型转换成bool类型的问题，但是一开始设计表是设计成了string类型，因此记录下flask-migrate更改表字段类型的方式。

#alembic支持检测字段长度改变，不过它不是默认的，需要配置；
#找到migrations/env.py文件，在run_migrations_online函数加入如下内容：

with connectable.connect() as connection:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        process_revision_directives=process_revision_directives,
        compare_type=True,  # 检查字段类型
        compare_server_default=True,  # 比较默认值
        **current_app.extensions['migrate'].configure_args
    )

```

### flask-sqlalchemy orm 一对多的使用
``` python

# 建表
class Users(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key = True)

    strategies = db.relationship('Strategy', back_populates="user")


class Strategy(db.Model):
    __tablename__ = 'strategy'

    id = db.Column(db.Integer, primary_key = True)
    user_strategy = db.Column( db.Text, default="{}", onupdate=datetime.datetime.now, comment=u"用户配置策略" )

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('Users', back_populates='strategies') # 对应Users的字段名 strategies

# 使用
    res = Users.query.filter(Users.id == 1).first()
    print(res.strategies[0].user_strategy)

    cls = Strategy.query.filter(Strategy.id == 6).first()
    print(res.user.id)

```

### restful api

``` python

# restful api
@api.representation('text/html') 
  def output_html(data, code, headers):
    resp = Response(data)
    return resp


def login_required(func):
  @functools.wraps(func) # 修饰内层函数，防止当前装饰器去修改被装饰函数的属性
  def inner(*args, **kwargs): 
    uid = session.get('uid')
    if not session.get('logged_in'):
      return {'msg': u'请登录后再次尝试'}, 403
    else:
      return func(*args, **kwargs)
  return inner
  

class Foo(Resource):
  method_decorators = {'get': [login_required]} # flask_restful 中装饰器的使用

  def get(self):
    pass

```
