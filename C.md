### 基础知识

```cpp
// 使用指针需要知道的三件事
int x = 4;
printf("x保存在 %p\n", &x)


// foo是x的地址， *foo是x地址中的值
int *foo = &x;  // 或者 int *foo;  foo=&x;
printf("%s \n", *foo);

char cc[15] = "maruihua";
char *s = &cc;  // *s=cc；也会输出 -> maruihua
printf("%s \n", s);


// 修改地址中的值
*foo = 10;

void foo(char a[]){
    printf("%d %s %d\n", sizeof(a), a, strlen(a));  // sizeof(a) 返回的是指针变量的大小
}
foo(cc)     // -> 4 maruihua 8  
```

```cpp
    int contestants[] = {1,2,3};

    int *choice = contestants;
    printf("%d %p %p \n",  *choice, choice, contestants);   // *choice -> 1, choice -> 以一位的地址

    contestants[0] = 2;
    contestants[1] = contestants[2];
    contestants[2] = *choice;

    printf("%d, %d ,%d\n", contestants[0], contestants[1], contestants[2]);

    return 0;
```

#### scanf

```cpp
  int age;
  scanf("%d", &age);

  char name[40];
  scanf("%39s", name);  // 输入39个字符 (+ '\0')
```

> 在 scanf 里 \n 很特别的,不是要求输入一个回车换行
>
> 引用一下别人的说法:
> 过滤空格、制表符、回车等输入，也就是说
> scanf(“%d\n”, &i);
> printf(“%d\n”, i);
> 你输入一个数后，它是不会立即显示的，要等再接收到一个非（空格、制表符、回车）的输入 scanf 语句才结束。
>
> 但请注意的是，最后输入的那个非（空格、制表符、回车）的东西是不会被这个 scanf 读进来的，而是留在输入流里


### string.h
``` C
strcmp()    // 比较字符串
strchr()    // 在字符串中查找字符
strstr()    // 在字符串中查找字符串
strcpy()    // 复制字符串
strlen()    // 返回字符串长度
strcat()    // 链接字符床
```


#### string 
```C
char song[][100] = {
    "There's a girl but I let her get away",
    "It's all my fault cause pride got the way",
    "..."
};

printf("%d\n", sizeof(song)/sizeof(char));    // song 的大小  300
printf("%d\n", sizeof(song[0])/sizeof(char)); // song 的列数  100
printf("%d\n", (sizeof(song)/sizeof(char)) / (sizeof(song[0])/sizeof(char)) ); // song 的行数 3
```