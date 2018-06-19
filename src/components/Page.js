import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Page.scss';

import CopyRight from 'react-icons/lib/fa/copyright';

function extractDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export class Header extends Component {

    render() {

        const avatar = this.props.avatar || "/favicon.png";
        const title  = this.props.title  || "ReSlice";
        const menu   = this.props.menu   || [];

        return <div className="header">
            <a href="/">
                <img src={avatar} alt={title} />
                <span>{title}</span>
            </a>
            <ul className="navbar">
                { menu.map((v,i) => !v[1].trim().startsWith("/") ? 
                    <li key={i}><a href={v[1]}>{v[0]}</a></li> :
                    <li key={i}><Link to={v[1]}>{v[0]}</Link></li>) }
            </ul>
        </div>

    }

}

export class Footer extends Component {
    
    render() {

        let latest =(this.props.content.article &&
                     this.props.content.article.sort &&
                     this.props.content.article.sort[0]) || null;
        if (latest) latest =(this.props.content.article.articles &&
                             this.props.content.article.articles[latest] &&
                             this.props.content.article.articles[latest].date) || null;

        return <div className="footer">
            <span><CopyRight />Copyright <a href={this.props.settings.url || "/"}>{this.props.settings.author || "ReSlice"}</a> {(new Date(latest)).getFullYear()} with Theme <a href="https://github.com/NHibiki/ReSlice">ReSlice</a>.</span>
            <span>Last Deployed on {this.props.content.device} by {this.props.content.createuser} at {extractDate(this.props.content.createtime)}.</span>
            <span>Applying {this.props.settings.license}.</span>
        </div>
    }

}