import React, { Component } from 'react';

import './Loader.scss';

export default class Loader extends Component {

    render() {
        return <div className={this.props.show ? "loader" : "loader hide"}>
            <ul className={this.props.show ? "ani" : null}>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    }

}