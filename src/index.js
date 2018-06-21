import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ReactDOM from 'react-dom';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import { Header, Footer } from './components/Page';
import Article from './components/Article';
import Cart from './components/Cart';
import ToolBar from './components/ToolBar';
import Loader from './components/Loader';
import NotFoundPage from './components/NotFoundPage';

import { getContent, Settings, GF } from './lib/Api';

import './index.scss';

class ReSlice extends Component {

    constructor(props) {
        super(props);
        this.state = {
            content: null,
            loader: true,
        };
    }

    doLoader(show=true) {
        if (show) {
            this.setState({loader: true});
            NProgress.start();
            window.scrollTo(0, 0);
        } else {
            this.setState({loader: false});
            NProgress.set(90); setTimeout(NProgress.done, 500);
        }
    }

    componentDidMount() {
        getContent().then(content => {
            this.setState({ content });
        }).catch(error => {
            console.log("Time Out!");
        });
        NProgress.configure({ parent: '#root', showSpinner: false });
        NProgress.start();
        GF.loader = this.doLoader.bind(this);
    }

    render () { return (
        <BrowserRouter>
            <div className="container">
                <Header avatar={Settings.avatar} title={Settings.title} menu={Settings.menu}/>
                <Switch>
                    <Route exact path="/articles/:id" component={Article}/>
                    <Route exact path="/tags/:id" component={Cart}/>
                    <Route exact path="/categories/:id" component={Cart}/>
                    <Route exact path="*" component={NotFoundPage} />
                </Switch>
                <Footer settings={Settings || {}} content={this.state.content || {}}/>
                <ToolBar />
                <Loader show={this.state.loader} />
            </div>
        </BrowserRouter>
    )};
}


ReactDOM.render(
    <ReSlice />,
    document.getElementById('root')
);