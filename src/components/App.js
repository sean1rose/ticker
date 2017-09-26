import '../assets/css/App.css';
import React, { Component } from 'react';
import { consumer_key, consumer_secret, access_token, access_token_secret, timeout_ms } from '../../Config';
import Twit from 'twit';
import RssFeedEmitter from 'rss-feed-emitter';

const T = new Twit({
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret,
  timeout_ms
});

let stream = T.stream('user', { with: ['coupleogoats'] });

let feeder = new RssFeedEmitter();
feeder.add({
  url: 'http://www.rotoworld.com/rss/feed.aspx?sport=nfl&ftype=news&count=12&format=rss',
  refresh: 1000
});
// http://www.rotowire.com/rss/news.htm?sport=nfl

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
  
  parseOutUrl(item) {
    let strArr = item.text.split(' ');
    let numberOfWords = strArr.length;
    let lastWord = strArr[numberOfWords - 1];
    let rejoinedStr;
    if (lastWord.includes("http")){
      strArr.pop();
      rejoinedStr = strArr.join(' ');
      item.text = rejoinedStr;
    }
  }

  componentDidMount() {

    // 1. BACK LOG of FantasyLab TWEETS
    T.get('statuses/user_timeline', { screen_name: 'FantasyLabsNFL', count: 20, exclude_replies: true, include_rts: false, trim_user: true}, (err, data, response) => {
      data.forEach((item) => {
        let currentDate = new Date(item.created_at).getTime();
        if (currentDate > twelveHoursAgo){
          // run check to make sure tweet meets news-worthy criteria
          if (!item.text.includes("@")){
            // if tweet text includes url, cut out that url
            if (item.text.includes("http")){
              this.parseOutUrl(item);
            }
            item.src = 'tweet-backlog'
            tweetsInLastHalfDay.push(item);
          }
        }
      });
      // console.log('tweets in last 1/2 day - ', tweetsInLastHalfDay);
      this.setState({
        tweetArr: tweetsInLastHalfDay
      });
      console.log('1. this.state.tweetArr [FINAL LIST OF INITIAL BACK LOG!!!!]- ', this.state.lastTweet, this.state.tweetArr);
    });

    // 2. NEW TWEET STREAM ITEM (FantasyLabs + Rotoworld)
    stream.on('tweet', (tweet) => {
      // console.log('2. liveFeed bout to send this thru socket emit -> ', tweet);
      if (!tweet.text.includes("@")){
        tweet.src = 'tweet-newstream';
        this.setState({
          tweetArr: [...this.state.tweetArr, tweet],
          tweetObj: {
            ...this.state.tweetObj,
            [tweet.id_str]: tweet
          },
          lastTweet: tweet
        });        
      }    
      console.log('2. state on [NEW TWEET EVENT] ', this.state.lastTweet, this.state.tweetArr);
    });

    // 3. NEW RSS FEED ITEM (Rotoworld)
    feeder.on('new-item', (item) => {
      console.log('3a - rss item - ', item);
      item.text = item.summary;
      item.src = 'rss';
      let tmpId = item['rss']['guid']['#'];
      this.setState({
        tweetArr: [...this.state.tweetArr, item],
        tweetObj: {
          ...this.state.tweetObj,
          [tmpId]: item
        },
        lastTweet: item
      }, console.log('new state after rss - ', this.state.tweetArr));
      console.log('3. [RSS feed item] - ', item.text, ' | state is - ', this.state.lastTweet, this.state.tweetArr);
    });
  }

  render() {
    console.log('---> 4. final news items on render - ', this.state.tweetArr);
    const newsItems = this.state.tweetArr.map((item) => {
      return (
        <div className="ticker__item" key={item.id_str}>{item.text}</div>
      );
    });

    let breakingNewsItem = null;
    if (this.state.lastTweet.text){
      console.log('5. breaking news item - ', this.state.lastTweet);
      breakingNewsItem = <div><h1 className="centered">LATEST:</h1><h3 className="centered">{this.state.lastTweet.text}</h3></div>;
    } else if (this.state.tweetArr.length > 0) {
      breakingNewsItem = <div><h1 className="centered">LATEST:</h1><h3 className="centered">{this.state.tweetArr[0].text}</h3></div>
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
