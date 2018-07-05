import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Left from 'react-icons/lib/fa/angle-left';
import Right from 'react-icons/lib/fa/angle-right';

import {isC} from '../lib/Api';

import './PageNavigator.scss';

export default class PageNavigator extends Component {

    render() {
        let rel = this.props.relation || [];
        return <div className="pageNavigator">
            {rel[0] ? <Link to={`/articles/${rel[0].id}`} className={"left"}><Left/></Link> : <a className={"left no"}><Left/></a>}
            {rel[1] ? <Link to={`/articles/${rel[1].id}`} className={"right"}><Right/></Link> : <a className={"right no"}><Right/></a>}
        </div>
    }

}