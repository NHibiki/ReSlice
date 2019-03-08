import React, { Component } from 'react';

import './NotFoundPage.scss';

import { getContent, switchTitle } from '../lib/Api';

export default class NotFoundPage extends Component {

    route() {
        getContent().then(content => {
            let route = content.article.sort[0];
            this.props.history.replace(`/articles/${route}`);
        }).catch(error => {
            console.log("Time Out!");
        });
    }

    componentWillMount() {
        switchTitle("Redirecting ...");
        this.route();
    }

    render() { return <div style={{position: "relative", height: "350px"}}>&nbsp;</div> }

}
