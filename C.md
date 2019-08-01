### 基础知识

```cpp
// 使用指针需要知道的三件事
int x = 4;
printf("x保存在 %p\n", &x)

/*
    *foo 是x地址中存的值
    foo  是x的地址
    &foo 是 *foo的地址

    可以理解为 foo： 指向x的地址
    * ：取值
    *foo: 取 foo 指向的地址中的值
*/
int *foo = &x;  // 或者 int *foo;  foo=&x;
printf("%d, %p, %p \n", *foo, &foo, foo);


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

#### 重定向标准输入(<) & 重定向标准输出(>)
``` c
// 将data传入到a(.exe)
./a < data.csv

// 将a执行的结果输出到 data.json
./a < data.csv > data.json
```
> csv: 以纯文本形式存储表格数据（数字和文本）, 每条记录被分隔符分隔为字段
> 	`1,2,'你好啊'`

#### fprintf

``` c
fprintf(stdout, "Invalid value:%d", year); // 标准输出
fprintf(stderr, "Invalid value:%d", year); // 标准错误（在终端中可以看到）

```

#### 创建自己的数据流 (读写文件)
``` c
// 每一条数据流用一个指向文件的指针来表示，可以用fopen()函数创建新数据流
// fopen()函数接收两个参数：文件名和模式。 
// 共有三种模式：w(写), r(读), a(在末尾追加写入)

// 创建一条数据流，从文件中读取数据
FILE *in = fopen("input.txt", "r");

// 创建一条数据流，向文件中写入数据
FILE *out = fopen("output.txt", "w");

// 创建数据流后，可以用 fprintf() 往数据流中打印数据，用 fscanf() 读取文件数据；
fscanf(in, "%79[^%\n]\n", line);
fprintf(out, "%s\n", line);

// 最后当用完数据流，关闭他们(即使他们会自动关闭);
fclose(in_file);
fclose(out_file);


/*
 * 用终端执行命令，动态的输出内容到文件
 * readfile1.exe hello ./src/out1.txt ./src/out2.txt
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// argc用来记录数组中元素的个数 
int main(int argc, char *argv[]){

    char line[80];

    if(argc != 4){
        fprintf(stderr, "需要4个参数, 当前%d", argc);
        return 1;
    }

    FILE *in = fopen("./src/in.txt", "r");

    fprintf(stderr, "argv: %s\n", argv[1]);
    FILE *f1 = fopen(argv[2], "w");
    FILE *f2 = fopen(argv[3], "w");

    while(fscanf(in, "%79[^\n]\n", line)==1){
        if( strstr(line, argv[1]) ){
            fprintf(f1, "%s+\n", line);
        }else{
            fprintf(f2, "%s+\n", line);
        }
    }

    return 0;
}
```

#### 不要重新编译所有文件
``` c

// 多个文件编译 gcc mmessage_hider.c encrypt.c -o message_hider

// 如果修改了文件，不要重新编译所有文件
// gcc -c *.c   创建目标文件，但是不链接成完整可执行的程序
// gcc *.o -o launch  把目标文件链接起来

// 如果修改过了一个文件，只需重新编译这个文件，然后重新链接
// gcc -c 修改的文件.c 

```


#### struct/typedef
``` c
    struct food{
        const char *name;
        float weight;
    };

    struct fish{
        const char *name;
        int age;
        struct food care;
    };

    struct fish shark{"shark", 12, {"liyu", 1.265}};

    // typedef
    typedef struct fish{
        const char *name;
        int age;
    }a_fish;

    // 不加 fish 也可以
    typedef struct{
        const char *name;
        int age;
    }a_fish;

    a_fish = {"shark", 12}

    a_fish.age = 20

```

### 链表创建
``` C

#include <stdio.h>

int main(){

    typedef struct employee{
        char *name;
        char *gender;
        int old;
        struct employee *next;
    }employee;

    employee ma = {"maruihua", "male", 24, NULL};
    employee wang = {"wangbo", "male", 24, NULL};
    employee liu = {"liulei", "male", 23, NULL};

    ma.next = &wang;
    wang.next = &liu;
    
    // 结构体指针
    employee *i = &ma
    for( ; i!=NULL; i= i->next ){
        // 注意这两种取值方式
        printf("name:%s, gender:%s, year:%d\n", (*i).name, (*i).gender, (*i).old);
        printf("name:%s, gender:%s, year:%d\n\n", i->name, i->gender, i->old);
    }

    return 0;
}


```
