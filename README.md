# ReSlice

这是一个由 React 编写的单页面博客，继承『[hexo-theme-slice](https://github.com/NHibiki/hexo-theme-slice)』，因为 hexo 对单页面 meta 生成支持实在不佳而转『主题』为『引擎』。在博客书写上完全（99%）支持 hexo 的 MarkDown meta 和 写作规范，生成单页面静态博客。

![ReSlice](https://img.shields.io/badge/Driven%20By-React%2016-ff4500.svg?style=flat-square)
![NHibiki](https://img.shields.io/badge/Author-NHibiki-40aa00.svg?style=flat-square)
![Code](https://img.shields.io/badge/Code%20With-<3-ff0000.svg?style=flat-square)

[样例](https://yuuno.cc) | [样例配置](https://github.com/NHibiki/blog) | [设计思路](https://yuuno.cc/articles/why-drop-hexo) | [使用方法](https://github.com/NHibiki/ReSlice#使用方法)

## 迁移

你不需要花费很多时间在博客的迁移上 (如果你愿意放弃 hexo 而使用本引擎)

首先你需要 Clone 下本 Repo

```sh
git clone https://github.com/NHibiki/ReSlice
```

然后，将你的 hexo 数据移植过来（目前只支持 post，还不支持 pages）

```sh
cp $PATH_TO_YOUR_HEXO_BLOG/source/_post/ ./ReSlice/public/documents
```

接下来你需要修改一些配置信息，你需要编辑 `./ReSlice/src/config.js` 文件

```javascript
module.exports = {
    title: "你的博客标题",
    author: "作者姓名",
    url: "作者介绍链接",
    disqus: "disqus 的短名(留空表示不添加 disqus 评论插件)",
    avatar: "/favicon.png(作者头像路径)",
    license: "Creative Commons Attribution-NonCommercial 4.0 International License(你的版权解释)",
    menu: [
        ["链接名称", "链接路径,可以相对可以绝对,案例如下"],
        ["首页", "/"],
        ["主页", "https://i.yuuno.cc"],
        ["简历", "https://yuuno.io"],
        ["友链", "/articles/links"]
    ]
}
```

这样你就基本迁移完成啦。

如果，你是在 netlify 等网站执行部署，别忘记将流量定向至 `index.html`。在 `./ReSlice/public` 下添加文件 `_redirects`，并输入：

```conf
/*    /index.html   200
```

至此，部署已经完成。您只需执行。

```sh
yarn && sh ./autobuild.sh
```

即可在 `./ReSlice` 下生成 `build` 文件夹。里面就是一个完整的网站。


## TODO

- [x] 搜索功能
- [x] tags / categories 匹配
- [x] 移动端适配
- [x] disqus 评论支持
- [ ] github 评论支持
- [ ] 页面分享功能
- [ ] 站点 RSS 生成
- [ ] 文章 RSS 生成
- [ ] 站点 SiteMap 生成
- [ ] 插件支持
