var axios = require('axios')
var Promise = require('bluebird')
var adjectiveConverter = require('./adjectiveConverter')

//it's being run locally with npm run dev
//get environment variables from .env
require('dotenv')
  .config({
    silent: process.env.NODE_ENV === 'production'
  });

function dataURIToBuffer(data_uri){
  debugger
  var regex = /^data:.+\/(.+);base64,(.*)$/;
  var matches = data_uri.match(regex);
  var ext = matches[1];
  var data = matches[2];
  return new Buffer(data, 'base64');
}

function recognizeImage(buffer){
  debugger

  var oxfordEmotion = require("node-oxford-emotion")
  (process.env.EMOTION_KEY);

  return new Promise(function(resolve, reject) {
      oxfordEmotion
        .recognize("image", buffer, function(value) {
          console.log('api returned: ', value);
          resolve(value);
        })
    })
}

function parseEmotionData(oxfordResponse) {
  debugger

  var faceData = JSON.parse(oxfordResponse)[0].scores;
  var topEmotion = Object
    .keys(faceData)
    .map(function(emotion) {
      return [emotion, faceData[emotion]];
    })
    .sort(function(a, b) {
      return b[1] - a[1];
    })
    .filter(function(l) {
      return l[1] >= .15;
    })
    .map(function(l) {
      return l[0];
    })
    .slice(0, 2)
    .sort()
    .join(' ');

  var emotion = adjectiveConverter[topEmotion];
  emotion = emotion ?
    emotion :
    adjectiveConverter[topEmotion.split(' ')[0]];

  console.log('emotion is: ', topEmotion, '-->', emotion);

  return emotion;

}

function fetchGiphyData (emotion){
  debugger
   return axios.get('http://api.giphy.com/v1/gifs/search', {
      params: {
        q: emotion,
        api_key: 'dc6zaTOxFJmzC',
        limit: 50
      }
    })
    .then(function(data){
      return [data, emotion]
    });

  }


function getGifs(data_uri) {

  var buffer = dataURIToBuffer(data_uri);

  recognizeImage(buffer)
    .then(parseEmotionData)
    .then(fetchGiphyData)
    .then(function(responseArray) {
      return {
        gifList: responseArray[0].data.data,
        emotion: responseArray[1]
      };
    });
  }

module.exports = {
  dataURIToBuffer : dataURIToBuffer,
  recognizeImage : recognizeImage,
  parseEmotionData : parseEmotionData,
  fetchGiphyData : fetchGiphyData,
  getGifs: getGifs
}
