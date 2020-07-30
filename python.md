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