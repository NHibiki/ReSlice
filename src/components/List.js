import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Hash from 'react-icons/lib/fa/hashtag';
import Plane from 'react-icons/lib/fa/paper-plane';

import './List.scss';

const icon = {
    tags: Hash,
    categories: Plane
}

export default class List extends Component {

    render() {
        return <ul className={`list ${this.props.type}`}>
            {(this.props.data || []).map((v, i) =>
                <li key={i}>
                    <Link to={`/${this.props.type}/${v}`}>
                        {React.createElement(icon[this.props.type])}<span>{v}</span>
                    </Link>
                </li>
            )}
        </ul>
    }

}