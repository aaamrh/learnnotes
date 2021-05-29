### 小知识
``` python
  str1 = 'a'
  str2 = 'a'
  print( id(str1), id(str2) ) # 给变量赋值，实际上传递的是新的常量地址
```


### 系统执行指令
``` python
  import os
  os.system('calc')
  os.system('taskkill /f /im notepad.exe')
```


### 交互式编程绘图
``` python
import turtle
turtle.showturtle()
turtle.write('hello python')
turtle.forward(100)
turtle.right(90)  # 转多少度
turtle.forward(100)

turtle.goto(100, 100)
turtle.penup()
turtle.pendown()
turtle.color('red')
turtle.circle(45)
```

### 优化技巧
``` python
if n == 0: 
  print(0)
elif n == 1:
  print(1)
elif n == 2:
  print(2)
else:
  print(-1)

# 优化后
def foo(x):
  return {
    0: 0,
    1: 1,
    2: 2
  }.get(x, -1)


```