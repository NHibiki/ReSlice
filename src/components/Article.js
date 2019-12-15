import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Right from 'react-icons/lib/fa/angle-right';
import Left  from 'react-icons/lib/fa/angle-left';

import marked from 'marked';
import {
    fetchContent as fetchContentApi,
    getContent,
    EMPTY,
    switchTitle,
    isC,
    GF,
    Settings,
    showTime,
    isCDN
} from '../lib/Api';
import PageNavigator from './PageNavigator';
import List from './List';

import './Article.scss';

const customizedHeading = / \{#[\S]+\}/;
const mdRenderer = new marked.Renderer();
      mdRenderer.heading = function (text, level) {
          let res = customizedHeading.exec(text);
          let id = '';
          if (!res || !res[0]) {
              id = text.trim().replace(/[\s]+/g, "-").toLocaleLowerCase();
          } else {
              id = res[0].substr(3, res[0].length-4);
              text = text.replace(res[0], "");
          }
          return `<h${level} id='${id}'>${text}</h${level}>`;
          
      };
      mdRenderer.image = function(href, title, text) {
          if (!href) return '';
          let _href = href;
          if (isCDN('media')) {
            const protoUrl = _href.split('://');
            if (protoUrl.length > 1 && protoUrl[0].match(/^[a-zA-Z]{1,10}$/)) {
                // has protocol prefix
                const restUrl = protoUrl.slice(1).join('://');
                const host = restUrl.split('/')[0];
                if (host === window.location.host) {
                    href = window.CDN + '/' + restUrl.split('/').slice(1).join('/');
                }
            } else {
                if (_href[0] === '/') {
                    // absolute path
                    if (_href[1] === '/') {
                        // absolute path with URL
                        const restUrl = _href.replace('//', '');
                        const host = restUrl.split('/')[0];
                        if (host === window.location.host) {
                            href = window.CDN + '/' + restUrl.split('/').slice(1).join('/');
                        }
                    } else {
                        // absolute path with no URL
                        href = window.CDN + _href;
                    }
                } else {
                    // relative path
                    const paths = window.location.pathname.split('/');
                    href = window.CDN + paths.slice(0, paths.length - 1).join('/') + '/' + _href;
                }
            }
          }
          return `<img src="${href}" title="${title}" alt="${text}" />`
      };
      mdRenderer._code = mdRenderer.code;
      mdRenderer.code = function(code, infostring, escape) {
          return mdRenderer._code(code, infostring, escape).replace(/<pre>/, `<pre type=${(infostring || 'CODE').toLocaleUpperCase()}>`);
      }

export default class Article extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: this.props.match.params.id,
            def: {},
            display: null,
            content: null,
            relation: [null, null]
        };
        this.highlight = false;
    }

    getPairs(article, id) {
        let index = article.sort.indexOf(id);
        if (index < 0) return [null, null];
        else {
            return [-1, 1].map(offset => {
                let newIndex = offset + index;
                if (newIndex < 0 || newIndex >= article.sort.length) return null;
                else return {
                    id: article.sort[newIndex],
                    def: article.articles[article.sort[newIndex]],
                }
            });
        }
    }

    loadDisqus() {
        const SN  = Settings.disqus;
        const SID = "disqus_loading_script";
        if (!SN || window.DISABLEDISQUS) return;
        var d = document, s = d.createElement('script'), ps = document.getElementById(SID);
        if (ps) ps.remove();
        s.id = SID;
        s.src = `https://${SN}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', +new Date());
        s.setAttribute('async', true);
        d.head.appendChild(s);
        const btn = document.getElementById('load-comment');
        if (btn) btn.remove();
    }

    fetchContent(id) {
        getContent().then(content => {
            let def = content.article.articles[id];
            let relation = this.getPairs(content.article, id);
            switchTitle((def.title || []).join(""));
            this.setState({ def, relation });
        }).catch(error => {
            console.log("Time Out!");
        });
        fetchContentApi(id)
            .then(data => {
                let display = null;
                let content = data.trim();
                if (content.startsWith("---")) content = content.substr(content.indexOf("\n")).trim();
                let startLine = content.indexOf("---");
                content = content.substr(content.indexOf("\n", startLine)).trim();
                if (startLine === -1) content = null;
                else { display = id; this.highlight = true; }
                this.setState({content, display});
            })
            .catch(error => {
                let content = null,
                    display = null;
                this.setState({content, display});
                console.log("Time Out!");
            });
    }

    componentDidMount() {
        this.fetchContent(this.state.id);
        GF.loader && GF.loader();
    }

    componentWillReceiveProps(nextProps, nextState) {
        let id = nextProps.match.params.id;
        if (id !== this.state.id) {
            this.fetchContent(id);
            this.setState({id});
            GF.loader && GF.loader();
        }
    }

    componentDidUpdate() {
        const Highlight = window.hljs;
        if (!Highlight || !this.highlight) return;

        document.querySelectorAll('pre code').forEach(block => {
            Highlight.highlightBlock(block);
            var mhtml = block.innerHTML;
            mhtml = "<cbr>" + mhtml.trim().split("\n").join("</cbr>\n<cbr>") + "</cbr>";
            block.innerHTML = mhtml;
        });
        // this.loadDisqus();
        this.highlight = false;
        GF.loader && GF.loader(false);
    }

    render() {

        const {title, tags, categories, date} = this.state.def || EMPTY;
        const rel = this.state.relation;
        const __html = marked(this.state.content || "", { sanitize: false, renderer: mdRenderer });

        return <div>
            <div className="titlebar">
                <h1 id="article-title">{title}</h1>
                <List type="categories" data={categories} />
                <List type="tags" data={tags} />
            </div>
            <div dangerouslySetInnerHTML={{__html}} className="article" />
            <p className="composeTime">{showTime(date)}</p>
            {/* <hr /> */}
            <PageNavigator relation={rel} />
            <div className="pagenav">
                {rel[0] ? <Link to={`/articles/${rel[0].id}`} className={isC(rel[0].def.title) ? "left no" : "left"}><i><Left/></i><span>{rel[0].def.title}</span></Link> : null}
                <span></span>
                {rel[1] ? <Link to={`/articles/${rel[1].id}`} className={isC(rel[1].def.title) ? "right no" : "right"}><span>{rel[1].def.title}</span><i><Right/></i></Link> : null}
            </div>
            <button id="load-comment" class="btn" onClick={this.loadDisqus.bind(this)}>LOAD COMMENTS</button>
            <div id="disqus_thread"></div>
        </div>
    }

}