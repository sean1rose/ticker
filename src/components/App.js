import '../assets/css/App.css';
import React, { Component } from 'react';
import { consumer_key, consumer_secret, access_token, access_token_secret, timeout_ms } from '../../Config';
import Twit from 'twit';

const T = new Twit({
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret,
  timeout_ms
});

let stream = T.stream('user', { with: ['coupleogoats'] });

const INITIAL_STATE = {
  tweetArr: [],
  tweetObj: {}
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    console.log('mounted, stream - ', stream, this.state);
    stream.on('tweet', (tweet) => {
      console.log('1 finaltwtt b4 - ', this.state.tweetArr, this.state.tweetObj);
      console.log('2. liveFeed bout to send this thru socket emit -> ', tweet);      
      this.setState({
        tweetArr: [...this.state.tweetArr, tweet],
        tweetObj: {
          ...this.state.tweetObj,
          [tweet.id_str]: tweet
        }
      });
      console.log('3 state - ', this.state.tweetArr, this.state.tweetObj);
    });  
  }

  render() {
    const newsItems = [{id_str: 1, text: 'Dez Bryant will play tomorrow'}, {id_str: 2, text: 'Larry Fitzgerald is listed as questionable'}].map((item) => {
    // const newsItems = this.state.tweetArr.map((item) => {
      return (
        <div className="ticker__item" key={item.id_str}>{item.text}</div>
      );
    });
    return (
      <div>
        <h1>Hello, Electron!</h1>
        <p>I hope you enjoy using basic-electron-react-boilerplate to start your dev off right!</p>
        <ul>
          {newsItems}
        </ul>
        <div className="ticker-wrap">
          <div className="ticker">
            {newsItems}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
