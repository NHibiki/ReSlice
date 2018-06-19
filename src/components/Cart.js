import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { getContent, switchTitle, isC } from '../lib/Api';

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
            id: props.match.params.id,
            type,
            content: [],
            articles: [],
        }
        switchTitle(trans[type]);
    }

    fetchContent() {
        getContent().then(rawContent => {
            let content = rawContent.article[this.state.type][this.state.id] || [];
            let articles = rawContent.article.articles;
            this.setState({content, articles});
        }).catch(error => {
            console.log("Time Out!");
        });
    }

    componentDidMount() {
        this.fetchContent();
    }

    render() {
        const {id, type, content, articles} = this.state;
        
        return <div className="article">
            <h2>{trans[type]}: {id}</h2>
            <ul className="cart">
                {content.map((v, i) => 
                    <li key={i}><Link to={`/articles/${v}`} className={isC(articles[v].title) ? "left-half" : null}>{articles[v].title}</Link> - <small>{articles[v].date}</small></li>
                )}
            </ul>
        </div>
    }

}