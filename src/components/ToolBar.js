import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { scrollToTop, searchFor, isC } from '../lib/Api';

import Up from 'react-icons/lib/fa/arrow-up';
import SearchIcon from 'react-icons/lib/fa/search';
import Close from 'react-icons/lib/fa/close';

import './ToolBar.scss';

export default class ToolBar extends Component {

    showSearch() {
        this.refs.search && this.refs.search.show();
    }

    render() { 
        return <div>
            <ul className="toolbar">
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