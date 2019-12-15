var fs = require('fs'),
    os = require('os'),
    nunjucks = require('nunjucks'),
    unified = require('unified'),
    remark = require('remark-parse'),
    rehtml = require('rehype-stringify'),
    remark2rehype = require('remark-rehype'),
    config = require("./src/config");
var env = new nunjucks.Environment();
    env.addFilter('uriencode', encodeURI);
    env.addFilter('noControlChars', str => str.replace(/[\x00-\x1F\x7F]/g, ''));
    env.addFilter('toUTC', str => (new Date(str)).toUTCString());
    env.addFilter('toISO', str => (new Date(str)).toISOString());
var info = (v) => console.log('\x1B[32m\[ReSlice\]\x1B[39m', v);
var info2 = (v) => console.log('\x1B[33m\[ReSlice\]\x1B[39m', v);
var error = (v) => console.log('\x1B[31m\[ReSlice\]\x1B[39m Error:', v);
var trimBoth = (s, e) => !s ? '' : s.startsWith(e) && s.endsWith(e) ? s.substr(1,s.length-2) : s;
var parseCol = (line) => line.trim().split(":").length === 1 ? [null, line.substr(line.indexOf("-") + 1).trim()] : [line.substr(0, line.indexOf(":")).trim() || null, trimBoth(trimBoth(line.substr(line.indexOf(":") + 1).trim(), '"'), "'") || null];
var reflact = (to, from, key) => {
    if (!to[key]) to[key] = new Object();
    from[key].forEach(item => {
        if (!to[key][item]) to[key][item] = [];
        to[key][item].push(from.id);
    });
}
var parseText = p => ((p.value === undefined ? "" : p.value) + (p.children ? p.children.map(pc => parseText(pc)) : ""));
var toUTC = s => s.toDate().toUTCString();
var tryFn = (fn, ...args) => {try { return fn(...args) } catch (error) {}}

async function pipeHTML(marked) {
    let res = await unified()
            .use(remark)
            .use(remark2rehype)
            .use(rehtml)
            .process(marked);
    return res.contents;
} 

var postData = {};
var postHTML = {};

async function run() {

    info2(`Doing Cleaning Up ...`);

    tryFn(fs.rmdirSync, `${__dirname}/public/feeds/`);
    tryFn(fs.unlinkSync, `${__dirname}/public/atom.xml`);
    tryFn(fs.unlinkSync, `${__dirname}/public/rss2.xml`);
    tryFn(fs.unlinkSync, `${__dirname}/public/sitemap.txt`);
    tryFn(fs.unlinkSync, `${__dirname}/public/sitemap.xml`);
    tryFn(fs.mkdirSync, `${__dirname}/public/feeds/`);

    info(`Scanning Document Folder ...`);
    const Dir = `${__dirname}/public/documents`;

    const mdDir = fs.readdirSync(Dir).filter(f=>f.endsWith(".md"));

    info2(`${mdDir.length} Documents Was Found ...`);
    info(`Creating JSON Meta ...`);

    var meta = {
        createtime: new Date().getTime(),
        createuser: os.userInfo().username,
        device: `${os.type()} ${os.arch()} ${os.release()}`,
        menu: {home: "/"},
        article: {
            tags: null,
            categories: null,
            count: 0,
            articles: {},
            sort: []
        },
    };
    for (md of mdDir) {
        let raw = fs.readFileSync(`${Dir}/${md}`).toString().trim();
        if (raw.startsWith("---")) raw = raw.substr(raw.indexOf("\n")).trim();
        let end = raw.indexOf("\n---");
        if (end < 3) { error(`Meta of ${md} Not Found! Skip ...`); return; }

        let art = raw.substr(end + 4).trim();
        raw = raw.substr(0, end);

        let lastKey = null;
        let data = {};
        raw.split("\n").forEach(line => {
            let [key, value] = parseCol(line);
            if (key !== null && value !== null) { data[key] = [value]; lastKey = key; }
            else if (key !== null) lastKey = key;
            else if (value !== null && lastKey !== null) if (data[lastKey]) data[lastKey].push(value); else data[lastKey] = [value];
        });
        data.id = md.substr(0, md.length - 3);
        data.date = data.date ? new Date(data.date[0]).getTime() : 0;

        if (data.tags) reflact(meta.article, data, "tags");
        if (data.categories) reflact(meta.article, data, "categories");

        meta.article.articles[data.id] = data;
        meta.article.count += 1;
        meta.article.sort.push(data.id);

        info(` - Scanning ${md} Success!`);

        postHTML[data.id] = await pipeHTML(art);
        postData[data.id] = parseText(unified().use(remark).parse(art)).trim().replace(/\s+/g, "");
        
        if (config.articleRss) {
            let xml = nunjucks.compile(fs.readFileSync(`./templates/art.xml`, 'utf8'), env)
                              .render({post: data, config, postData, postHTML, toUTC, contentSummaryLimit: 50})
                              .split('\n')
                              .map(line => line.trim())
                              .filter(Boolean)
                              .join("\n");
            fs.writeFileSync(`${__dirname}/public/feeds/${data.id}.xml`, xml);
        }

        info2(` - Remark ${md} Success!`);

    }

    info(`Sorting All Articles ...`);

    meta.article.sort.sort((a, b) => new Date(meta.article.articles[a].date) < new Date(meta.article.articles[b].date) ? 1 : -1);

    info2(`Done With Meta Generation ...`);

    info(`Generating With Site RSS ...`);

    let select = (config.rss || "atom").trim();
    if (!["rss2", "atom"].includes(select)) select = "atom";

    info2(`Your Choice is [${select}]`);

    meta.rss = `${select}.xml`;

    let xmlPath = `./templates/${select}.xml`;
    let xml = nunjucks.compile(fs.readFileSync(xmlPath, 'utf8'), env)
                    .render({meta, config, postData, postHTML, toUTC, contentSummaryLimit: 50})
                    .split('\n')
                    .map(line => line.trim())
                    .filter(Boolean)
                    .join("\n");
    fs.writeFileSync(`${__dirname}/public/${select}.xml`, xml);

    info2(`Done With Site RSS Generation ...`);

    if (config.siteMap) {

        info(`Start Generating SiteMap ...`);

        meta.siteMap = "sitemap.xml";
        let siteXmlPath = `./templates/sitemap.xml`;
        let siteXml = nunjucks.compile(fs.readFileSync(siteXmlPath, 'utf8'), env)
                            .render({meta, config, current: (new Date()).getTime(), categories: Object.keys(meta.article.categories), tags: Object.keys(meta.article.tags)})
                            .split('\n')
                            .map(line => line.trim())
                            .filter(Boolean)
                            .join("\n");
        fs.writeFileSync(`${__dirname}/public/sitemap.xml`, siteXml);

        info2(`Create SiteMap File 'sitemap.xml' ...`);

        meta.siteMapTxt = "sitemap.txt";
        linksList = [];
        for (let id of meta.article.sort) linksList.push(`${config.base}articles/${id}`);
        for (let id in meta.article.categories) linksList.push(`${config.base}categories/${id}`);
        for (let id in meta.article.tags) linksList.push(`${config.base}tags/${id}`);
        fs.writeFileSync(`${__dirname}/public/sitemap.txt`, linksList.join("\n"));

        info2(`Create SiteMap File 'sitemap.txt' ...`);

        const robots = `
# Group 1
User-agent: Googlebot-Image
Disallow: /

# Group 2
User-agent: *
Disallow: /admin/

# Group 3
User-agent: *
Allow: /

Sitemap: ${config.base}sitemap.xml`;
        fs.writeFileSync(`${__dirname}/public/robots.txt`, robots);
        info2(`Create robots.txt for the site ...`);

    }

    info(`Save All Metas to content.json ...`);

    fs.writeFileSync(`${__dirname}/public/content.json`, JSON.stringify(meta));

    info2(`All Done!`);

}

run().then(() => {
    process.exit(0);
});
