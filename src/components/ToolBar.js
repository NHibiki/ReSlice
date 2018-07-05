import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { scrollToTop, searchFor, isC } from '../lib/Api';

import Twitter from 'react-icons/lib/fa/twitter';
import Facebook from 'react-icons/lib/fa/facebook';
// import Telegram from './Telegram.svg';

import Up from 'react-icons/lib/fa/arrow-up';
import SearchIcon from 'react-icons/lib/fa/search';
import Close from 'react-icons/lib/fa/close';

import './ToolBar.scss';

const SURL = { 
    facebook: ["https://www.facebook.com/sharer/sharer.php", "u", "quote"], 
    twitter:  ["https://twitter.com/share/", "url", "text"], 
    telegram: ["https://telegram.me/share/", "url", "text"]
}

class Telegram extends Component {
    render() {
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 300 300">
            <path fill="#c8daea" d="m98 175c-3.8876 0-3.227-1.4679-4.5678-5.1695L82 132.2059 170 80"/>
            <path fill="#a9c9dd" d="m98 175c3 0 4.3255-1.372 6-3l16-15.558-19.958-12.035"/>
            <path fill="#ffffff" d="m100.04 144.41 48.36 35.729c5.5185 3.0449 9.5014 1.4684 10.876-5.1235l19.685-92.763c2.0154-8.0802-3.0801-11.745-8.3594-9.3482l-115.59 44.571c-7.8901 3.1647-7.8441 7.5666-1.4382 9.528l29.663 9.2583 68.673-43.325c3.2419-1.9659 6.2173-0.90899 3.7752 1.2584"/>
        </svg>
    }
}

export default class ToolBar extends Component {

    showSearch() {
        this.refs.search && this.refs.search.show();
    }

    shareClicked(item="telegram") {
        if (item in SURL) {
            let urlConf = SURL[item];
            let url = `${urlConf[0]}?${urlConf[1]}=${window.location.href}&${urlConf[2]}=${window.document.title}`;
            window.open(url, "_blank");
        }
    }

    render() { 
        return <div>
            <ul className="toolbar">
                <li onClick={this.shareClicked.bind(this, "telegram")}><Telegram /></li>

                <li onClick={this.shareClicked.bind(this, "twitter")}><Twitter /></li>
                <li onClick={this.shareClicked.bind(this, "facebook")}><Facebook /></li>

                <li className="gap"></li>
                
                <li onClick={this.showSearch.bind(this)}><SearchIcon /></li>
                <li onClick={scrollToTop}><Up /></li>
            </ul>
            <Search ref="search"/>
        </div>
    }

}

class Search extends Component {

    state = {
        show: false,
        words: "",
        res: [],
    }

    componentWillUpdate(newProps, newState) {
        if (newState.show) {
            window.document.children[0].style.overflow = "hidden";
            this.refs.input && this.refs.input.focus();
        } else {
            window.document.children[0].style.overflow = "auto";
        }
    }

    onChange(proxy) {
        let words = proxy.target.value;
        this.setState({words});
        searchFor(words).then(res => {
            this.setState({res});
        }).catch(error => {
            console.log("Time Out!");
        });
    }

    show() {
        this.setState({show: true});
    }

    hide() {
        this.setState({show: false}, () => {
            setTimeout(() => {
                this.setState({words: "", res: []});
            }, 250);
        });
    }

    render() {
        return <div className={this.state.show ? "search" : "search hide"}>
            <div className="container">
                <div className="inputHolder"></div>
                <input 
                    ref="input"
                    value={this.state.words}
                    placeholder="Search ..."
                    onChange={this.onChange.bind(this)}
                />
                <div className="searchResult">
                    {this.state.res.map((art, i) => 
                        <SearchTag data={art} key={i} hide={this.hide.bind(this)}/>
                    )}
                </div>
                <ul className={this.state.show ? "toolbar" : "toolbar hide"}>
                    <li onClick={this.hide.bind(this)}><Close /></li>
                    <li className="disabled"><Up /></li>
                </ul>
            </div>
        </div>
    }

}

class SearchTag extends Component {

    render() {

        let art = this.props.data;

        return <Link to={`/articles/${art.id}`} className="searchTag" onClick={this.props.hide}>
            <h4 className={isC(art.title) ? "no" : null}>{art.title}</h4>
            <span>{art.date}</span>
            <small>{art.id}</small>
        </Link>

    }

}