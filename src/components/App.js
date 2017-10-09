import '../assets/css/App.css';
import React, { Component } from 'react';
import { consumer_key, consumer_secret, access_token, access_token_secret, timeout_ms } from '../../Config';
import Twit from 'twit';
import _ from 'lodash';

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
    T.get('statuses/user_timeline', { screen_name: 'FantasyLabsNFL', count: 30, exclude_replies: true, include_rts: false, trim_user: true}, (err, data, response) => {
      data.forEach((item) => {
        let currentDate = new Date(item.created_at).getTime();
        if (currentDate > twelveHoursAgo){
          // run check to make sure tweet meets news-worthy criteria
          if (!item.text.includes("@")){
            // if tweet text includes url, cut out that url
            if (item.text.includes("http")){
              this.parseOutUrl(item);
            }
            item.src = 'tweet-backlog-FantasyLabsNFL';
            tweetsInLastHalfDay.push(item);
          }
        }
      });
      // console.log('tweets in last 1/2 day - ', tweetsInLastHalfDay);
      this.setState({
        // tweetArr: [...this.state.tweetArr,tweetsInLastHalfDay],
        tweetArr: _.merge(this.state.tweetArr, tweetsInLastHalfDay)
      });
      console.log('1a. this.state.tweetArr [FINAL LIST OF INITIAL BACK LOG!!!!]- ', this.state.lastTweet, this.state.tweetArr);
    });

    T.get('statuses/user_timeline', { screen_name: 'Rotoworld_Fb', count: 30, exclude_replies: true, include_rts: false, trim_user: true}, (err, data, response) => {
      data.forEach((item) => {
        let currentDate = new Date(item.created_at).getTime();
        if (currentDate > twelveHoursAgo){
          // run check to make sure tweet meets news-worthy criteria
          if (!item.text.includes("@")){
            // if tweet text includes url, cut out that url
            if (item.text.includes("http")){
              this.parseOutUrl(item);
            }
            item.src = 'tweet-backlog-Rotoworld_Fb';
            tweetsInLastHalfDay.push(item);
          }
        }
      });
      // console.log('tweets in last 1/2 day - ', tweetsInLastHalfDay);
      this.setState({
        // tweetArr: [...this.state.tweetArr, tweetsInLastHalfDay],
        tweetArr: _.merge(this.state.tweetArr, tweetsInLastHalfDay)
      });
      console.log('1b. this.state.tweetArr [FINAL LIST OF INITIAL BACK LOG!!!!]- ', this.state.lastTweet, this.state.tweetArr);
    });


    // 2. NEW TWEET STREAM ITEM (FantasyLabs + Rotoworld)
    stream.on('tweet', (tweet) => {
      // console.log('2. liveFeed bout to send this thru socket emit -> ', tweet);
      if (!tweet.text.includes("@")){
        if (tweet.text.includes("http")){
          console.log('tweet text - ', tweet.text, tweet);
          this.parseOutUrl(tweet);
        }
        tweet.src = 'tweet-newstream';
        this.setState({
          tweetArr: [...this.state.tweetArr, tweet],
          lastTweet: tweet
        });        
      }    
      console.log('3. state on [NEW TWEET EVENT] ', this.state.lastTweet, this.state.tweetArr);
    });

  }

  printItems(sortedItems) {
    for (var i = 0; i < sortedItems.length; i++){
      if (i && sortedItems[i])
        console.log(`${sortedItems[i].created_at} | ${sortedItems[i].text} | ${sortedItems[i].src}`);
    }
  }

  tickerItems() {
    let sortedItems = this.state.tweetArr.sort((a,b) => {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
    console.log('afeter sort - ', sortedItems);
    this.printItems(sortedItems);
    const tickerItems = sortedItems.map((item, idx) => {
      return (
        <div className="ticker__item" key={item.id_str}>{item.text}</div>
      );
    });
    return tickerItems;
  }

  recentItems(number) {
    let sortedItems = this.state.tweetArr.sort((a,b) => {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
    const recentItems = sortedItems.slice(1, number+1).map((item, idx) => {
      return (
        <li className="recentlistitem" key={item.id_str}>-{item.text}</li>
      );
    });
    return(
      <ul className="recentlist">
        {recentItems}
      </ul>
    )
  }

  latestItem() {
    let breakingNewsItem = null;
    if (this.state.lastTweet.text){
      breakingNewsItem = <div><h3 className="centered; latest">LATEST:</h3><h4 className="centered; latestitem">{this.state.lastTweet.text}</h4></div>;
    } else if (this.state.tweetArr.length > 0) {
      breakingNewsItem = <div><h3 className="centered; latest">LATEST:</h3><h4 className="centered latestitem">{this.state.tweetArr[0].text}</h4></div>
    }
    return breakingNewsItem;
  }


  render() {
    return (
      <div>
        {this.latestItem()}
        <div className="recentitems">
          {this.recentItems(10)}
        </div>
        <div className="ticker-wrap">
          <div className="ticker">
            {this.tickerItems()}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
