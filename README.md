# 目标

自动生成增删改查页面,不限定于增删改查页面，希望能够自动生成相应目录文件，比如我想通过快速生成一个页面，这个页面包含样式文件，本身页面，modal，route 等，可以理解为一个升级版的代码片段，代码片段根据几个字母生成一段代码，而这里同样快速的生成一个或多个页面

# 实现

## 脚本

1. 读取所有可生成模板
2. 用户输入在哪一个目录下生成模板
3. 用户选择生成哪一个模板
4. 给模板命名
5. 根据名字替换模板对应位置和导入关系、格式化
6. 生成模板

需要根据模板文件来生成相应的文件

模板文件夹示例:

```
all-template
    │
    └─edit
            index.json
            index.txt
            model.txt
```

index.json:

| key      |                                              说明                                               |
| -------- | :---------------------------------------------------------------------------------------------: |
| argument |         模板内替换的内容，比如这里的 name，那么组件内的${name}会被替换为用户输入的内容          |
| files    | 多个目标生成文件信息：path(当前文件生成的位置)，template(模板文件名)，extname(生成文件拓展名)， |

```json
{
  "name": "add",
  "argument": [{ "message": "组件名", "name": "name" }],
  "files": [
    {
      "path": "./",
      "template": "./model.txt",
      "extname": "ts"
    },
    {
      "path": "./",
      "template": "./index.txt",
      "extname": "tsx"
    }
  ]
}
```
