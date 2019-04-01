# Flask 捯饬笔记

> 小命令
> - `pip install --update <包名称>`  更新包
> - `pipenv install` 创建虚拟环境
> - `pipenv shell` 激活虚拟环境
> - `pipenv graph` 查看当前环境下的依赖情况
> - `pipenv run` 用当前虚拟环境运行程序 eg: pipenv run python

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

#### get
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
```python
    @app.context_processor
    def inject_foo():
        foo = 'I am foo.'
        bar = 'I am bar.'
        return dict(foo=foo,bar=bar)

    # .html
    {{foo}}
    {{bar}}
```


### 自定义全局函数
```python
    @app.template_global()
    def bar():
        return 'this is bar'
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
```sql
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


