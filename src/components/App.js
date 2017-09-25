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

let oneDayAgo = new Date().getTime() - 86400000;
let twelveHoursAgo = new Date().getTime() - 43200000;
let tweetsInLastHalfDay = [];
let INITIAL_STATE = {
  tweetArr: [],
  tweetObj: {},
  lastTweet: {}
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }
  
  componentDidMount() {
    console.log('T -> ', T);

    // BACK LOG
    T.get('statuses/user_timeline', { screen_name: 'FantasyLabsNFL', count: 20, exclude_replies: true, include_rts: false, trim_user: true}, (err, data, response) => {
      data.forEach((item) => {
        // console.log('0 item - ', item.text);
        let currentDate = new Date(item.created_at).getTime();
        // console.log('current date - ', currentDate);
        if (currentDate > twelveHoursAgo){
          // run check to make sure tweet meets news-worthy criteria
          
          if (!item.text.includes("@")){
            // if tweet text includes url, cut out that url
            let strArr = item.text.split(' ');
            let numberOfWords = strArr.length;
            let lastWord = strArr[numberOfWords - 1];
            let rejoinedStr;
            if (lastWord.includes("http")){
              strArr.pop();
              // console.log('---> strArr after pop- ', strArr);
              rejoinedStr = strArr.join(' ');
              // console.log('*** - ', rejoinedStr);
              item.text = rejoinedStr;
            }

            tweetsInLastHalfDay.push(item);
          }
        }
      });
      console.log('tweets in last 1/2 day - ', tweetsInLastHalfDay);
      this.setState({
        tweetArr: tweetsInLastHalfDay
      });
      console.log('this.state.tweetArr [FINAL LIST OF INITIAL BACK LOG!!!!]- ', this.state.tweetArr);
    });

    // NEW TWEET STREAM
    console.log('mounted, stream - ', stream, this.state);
    stream.on('tweet', (tweet) => {
      console.log('1 finaltwtt b4 - ', this.state.tweetArr, this.state.tweetObj);
      console.log('2. liveFeed bout to send this thru socket emit -> ', tweet);      
      this.setState({
        tweetArr: [...this.state.tweetArr, tweet],
        tweetObj: {
          ...this.state.tweetObj,
          [tweet.id_str]: tweet
        },
        lastTweet: tweet
      });
      console.log('3 state - ', this.state.tweetArr, this.state.tweetObj);
    });  
  }

  render() {
    // const newsItems = [{id_str: 1, text: 'Dez Bryant will play tomorrow'}, {id_str: 2, text: 'Larry Fitzgerald is listed as questionable'}].map((item) => {
    const newsItems = this.state.tweetArr.map((item) => {
      return (
        <div className="ticker__item" key={item.id_str}>{item.text}</div>
      );
    });

    let breakingNewsItem = null;
    if (this.state.lastTweet.text){
      breakingNewsItem = <div><h1 className="centered">BREAKING!</h1><h3 className="centered">{this.state.lastTweet.text}</h3></div>
    } else {
      breakingNewsItem = <div></div>
    }

    return (
      <div>
        {breakingNewsItem}
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
