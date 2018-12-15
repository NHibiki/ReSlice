import config from '../config.js';

let Content = {};
let FetchingState = 0;
export const Settings = config;
export var GF = {};

export var EMPTY = {title:null, tags:null, categories:null, date:null, id:null};

let initArticles = function() {
    if (!Content.article) {
        FetchingState = 1;
        fetch("/content.json")
            .then(res => res.json())
            .then(data => { Content = data; FetchingState = 0; })
            .catch(error => { Content = {}; FetchingState = 0; });
    }
}
initArticles();

export function fetchContent(id, callback=()=>{}) {
    return new Promise((resolve, reject) => {
        fetch(`/documents/${id}.md`)
            .then(res => res.text())
            .then(data => { callback(data); resolve(data); })
            .catch(error => { callback(error); reject(error); });
    });
}

export function getContent(callback=()=>{}) {
    return new Promise((resolve, reject) => {
        if (!FetchingState) { callback(Content); resolve(Content); }
        else {
            let currentTime = 0;
            let currentInterval = setInterval(() => {
                currentTime++;
                if (currentTime > 100 || !FetchingState) {
                    clearInterval(currentInterval);
                    FetchingState = 0;
                    if (Content.article) { callback(Content); resolve(Content); }
                    else { callback(null); reject(null); }
                }
            }, 100);
        }
    });
}

export function switchTitle(title) {
    window.document.title = `${Settings.title} | ${title}`;
}

export function scrollToTop() {
    const y = document.documentElement.scrollTop || document.body.scrollTop;
    if (y > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, y - 80);
    }
};

export function isC(title) {
    return [12300, 12304].includes((title || []).join("").charCodeAt(0));
}

export function searchFor(text) {
    text = text.trim().toLocaleLowerCase();
    return new Promise((resolve, reject) => {
        if (!text) resolve([]);
        getContent().then(content => {
            let res = content.article.sort
                .filter(id => {
                    let article = content.article.articles[id];
                    return article.tags.join("").toLocaleLowerCase().includes(text) ||
                           article.categories.join("").toLocaleLowerCase().includes(text) ||
                           article.title.join("").toLocaleLowerCase().includes(text);
                })
                .map(id => content.article.articles[id]);
            resolve(res);
        }).catch(error => {
            reject(error);
        });
    });
}

export function timePad(i) {
    if (i < 10) return `0${i}`;
    else return `${i}`;
}

export function showTime(time) {
    let t = new Date(time);
    return `${t.getFullYear()}-${timePad(t.getMonth()+1)}-${timePad(t.getDate())} ${timePad(t.getHours())}:${timePad(t.getMinutes())}:${timePad(t.getSeconds())}`;
}