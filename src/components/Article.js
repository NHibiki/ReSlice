import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Highlight from '../../node_modules/highlight.js/lib/index';

import Right from 'react-icons/lib/fa/angle-right';
import Left  from 'react-icons/lib/fa/angle-left';

import { fetchContent as fetchContentApi, getContent, EMPTY, switchTitle, isC, GF } from '../lib/Api';
import List from './List';

import './Article.scss';

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
        if (!this.highlight) return;
        document.querySelectorAll('pre code').forEach(block => {
            Highlight.highlightBlock(block);
            var mhtml = block.innerHTML;
            mhtml = "<cbr>" + mhtml.split("\n").join("</cbr>\n<cbr>");
            block.innerHTML = mhtml.substring(0, mhtml.length - 7);
        });
        setTimeout(() => {
            GF.loader && GF.loader(false);
        }, 1000);
        this.highlight = false;
    }

    render() {

        const {title, tags, categories, date} = this.state.def || EMPTY;
        const rel = this.state.relation;

        return <div>
            <div className="titlebar">
                <h1>{title}</h1>
                <List type="categories" data={categories} />
                <List type="tags" data={tags} />
            </div>
            <ReactMarkdown escapeHtml={false} source={this.state.content} className="article" />
            <p className="composeTime">{date}</p>
            {/* <hr /> */}
            <div className="pagenav">
                {rel[0] ? <Link to={`/articles/${rel[0].id}`} className={isC(rel[0].def.title) ? "left no" : "left"}><Left/><span>{rel[0].def.title}</span></Link> : null}
                <span></span>
                {rel[1] ? <Link to={`/articles/${rel[1].id}`} className={isC(rel[1].def.title) ? "right no" : "right"}><span>{rel[1].def.title}</span><Right/></Link> : null}
            </div>
        </div>
    }

}