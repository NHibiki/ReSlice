var fs = require('fs'),
    os = require('os');
var info = (v) => console.log('\x1B[32m\[ReSlice\]\x1B[39m', v);
var error = () => console.log('\x1B[31m\[ReSlice\]\x1B[39m Error:', v);
var parseCol = (line) => line.trim().split(":").length === 1 ? [null, line.substr(line.indexOf("-") + 1).trim()] : [line.substr(0, line.indexOf(":")).trim() || null, line.substr(line.indexOf(":") + 1).trim() || null];
var reflact = (to, from, key) => {
    if (!to[key]) to[key] = new Object();
    from[key].forEach(item => {
        if (!to[key][item]) to[key][item] = [];
        to[key][item].push(from.id);
    });
}


info(`Scanning Document Folder ...`);
const Dir = `${__dirname}/public/documents`;

const mdDir = fs.readdirSync(Dir).filter(f=>f.endsWith(".md"));

info(`${mdDir.length} Documents Was Found ...`);
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
mdDir.forEach(md => {
    let raw = fs.readFileSync(`${Dir}/${md}`).toString().trim();
    if (raw.startsWith("---")) raw = raw.substr(raw.indexOf("\n")).trim();
    let end = raw.indexOf("\n---");
    if (end < 3) { error(`Meta of ${md} Not Found! Skip ...`); return; }
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
    data.date = data.date ? data.date[0] : 0;

    if (data.tags) reflact(meta.article, data, "tags");
    if (data.categories) reflact(meta.article, data, "categories");

    meta.article.articles[data.id] = data;
    meta.article.count += 1;
    meta.article.sort.push(data.id);

    info(` - Scanning ${md} Success!`);
});

info(`Sorting All Articles ...`);

meta.article.sort.sort((a, b) => new Date(meta.article.articles[a].date) < new Date(meta.article.articles[b].date) ? 1 : -1);

info(`Save to content.json ...`);

fs.writeFileSync(`${__dirname}/public/content.json`, JSON.stringify(meta));

info(`Done With Meta Generation ...`);