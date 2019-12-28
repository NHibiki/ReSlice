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
import Plugin from './plugin';

import './index.scss';
import './registerServiceWorker';

class ReSlice extends Component {

    constructor(props) {
        super(props);
        this.state = {
            content: null,
            loader: true,
        };
        NProgress.configure({ parent: '#root', showSpinner: false });
        NProgress.start();
        GF.loader = this.doLoader.bind(this);
        GF.loaded = function () { return !this.state.loader; }.bind(this);
    }

    doLoader(show=true) {
        if (show) {
            this.setState({loader: true});
            NProgress.start();
            window.scrollTo(0, 0);
        } else {
            this.setState({loader: false});
            // NProgress.set(0.9); setTimeout(NProgress.done, 500);
            NProgress.done();
        }
    }

    componentDidMount() {
        getContent().then(content => {
            this.setState({ content });
        }).catch(error => {
            console.log("Time Out!");
        });
    }

    render () { return (
        <BrowserRouter>
            <div className="container">
                <Header avatar={Settings.avatar} title={Settings.title} menu={Settings.menu}/>
                <Switch>
                    <Route exact path="/articles/:id" component={Article}/>
                    <Route exact path="/tags/:id" component={Cart}/>
                    <Route exact path="/categories/:id" component={Cart}/>
                    <Route exact path="/tags" component={Cart}/>
                    <Route exact path="/categories" component={Cart}/>
                    {Plugin.filter(p => p && p.entrypoint && p.component).map(p => {
                        return (<Route exact key={p.entrypoint} path={p.entrypoint} component={_ => <PluginWrapper component={p.component} />} />);
                    })}
                    <Route exact path="*" component={NotFoundPage} />
                </Switch>
                <Footer settings={Settings || {}} content={this.state.content || {}}/>
                <ToolBar />
                <Loader show={this.state.loader} />
            </div>
        </BrowserRouter>
    )};
}

class PluginWrapper extends Component {

    componentDidMount() {
        if (!GF.loaded()) setTimeout(_ => GF.loader(false), 10);
    }

    componentDidCatch() {
        this.props.history.push(`/error`);
    }

    render() {
        return React.createElement(this.props.component);
    }

}

ReactDOM.render(
    <ReSlice />,
    document.getElementById('root')
);