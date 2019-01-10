# Flask 捯饬笔记

> 小命令
> - `pip install --update <包名称>`  更新包
> - `pipenv install` 创建虚拟环境
> - `pipenv shell` 激活虚拟环境
> - `pipenv graph` 查看当前环境下的依赖情况

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