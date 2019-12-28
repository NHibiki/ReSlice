import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { getContent, switchTitle, isC, GF, showTime } from '../lib/Api';

import List from './List';
import './Cart.scss';

const trans = {
    "tags": "标签",
    "categories": "类别"
}

export default class Cart extends Component {

    constructor(props) {
        super(props);
        let type = props.match.path.split("/")[1];
        this.state = {
            id: props.match.params.id || '',
            type,
            content: [],
            articles: [],
        }
        switchTitle(trans[type]);
    }

    fetchContent() {
        getContent().then(rawContent => {
            if (this.state.id) {
                let content = rawContent.article[this.state.type][this.state.id] || [];
                let articles = rawContent.article.articles;
                content.sort((a, b) => new Date(articles[a].date) < new Date(articles[b].date) ? 1 : -1);
                this.setState({content, articles});
            } else {
                let articles = rawContent.article[this.state.type] || {};
                let content = Object.keys(articles);
                content.sort((a, b) => articles[a].length < articles[b].length ? 1 : -1);
                this.setState({content, articles});
            }
            GF.loader && GF.loader(false);
        }).catch(error => {
            console.log("Time Out!");
            GF.loader && GF.loader(false);
        });
    }

    componentDidMount() {
        GF.loader && GF.loader();
        this.fetchContent();
    }

    componentWillUpdate(props) {
        let type = props.match.path.split("/")[1];
        let id = props.match.params.id || '';
        if (type !== this.state.type || id !== this.state.id) {
            this.setState({ type, id }, this.fetchContent.bind(this));
        }
    }

    render() {
        const {id, type, content, articles} = this.state;
        
        return <div className="article">
            <h2>{trans[type]}: {id}</h2>
            <ul className="cart">
                {
                    this.state.id
                    ? content.map((v, i) => <li key={i}><Link to={`/articles/${v}`} className={isC(articles[v].title) ? "left-half" : null}>{articles[v].title}</Link> - <small>{showTime(articles[v].date)}</small></li>)
                    : content.map((v, i) => <li key={i}><List type={this.state.type} data={[v]} /> - <small>{articles[v].length}</small></li>)
                }
            </ul>
        </div>
    }

}