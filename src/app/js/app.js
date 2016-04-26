import React from 'react';
import {Router, Route, IndexRoute, Link, browserHistory} from 'react-router';
import {render} from 'react-dom';
import {Flux, Component} from 'flumpt';

class IndexPage extends React.Component {
  render() {
    return (
      <div>
        <Link to="/mycomponent">My Component Page</Link>
      </div>
    );
  }
}

class MyComponentPage extends Component {
  componentDidMount() {
    this.dispatch("increment");
  }
  render() {
    return (
      <div>
        <Link to="/">Home</Link>
        <hr />
        {this.context.emitter.state.count}
        <br />
        <button onClick={() => this.dispatch("increment")}>increment</button>
      </div>
    );
  }
}

class Root extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

class Routes extends React.Component {
  
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Root}>
          <IndexRoute component={IndexPage}/>
          <Route path="/mycomponent" component={MyComponentPage}/>
        </Route>
      </Router>
    );
  }
}

class App extends Flux {
  subscribe() { // `subscribe` is called once in constructor
    this.on("increment", () => {
      this.update(({count}) => {
        return {count: count + 1}; // return next state
      });
    });
  }

  render(state) {
    return <Routes {...state}/>;
  }
}

const initialState = {};

// Setup renderer
const app = new App({
  renderer: el => {
    render(el, document.getElementById('app'));
  },

  initialState: initialState,

  middlewares: [
    // logger
    //   it may get state before unwrap promise
    (state) => {
      if (process.env.NODE_ENV !== 'production') {
        console.info('state: ', state);
      }
      return state
    }
  ]
});

app.on(":start-async-updating", () => {
  // overlay ui lock
  console.log("start-async-updating");
});
app.on(":end-anync-updating", () => {
  // hide ui lock
  console.log("end-async-updating");
});

app.update(_initialState => ({count: 1})); // it fires rendering
