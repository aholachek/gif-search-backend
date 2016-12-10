var axios = require('axios')
var Promise = require('bluebird')

//it's being run locally with npm run dev
//get environment variables from .env
require('dotenv')
  .config({
    silent: process.env.NODE_ENV === 'production'
  })

var adjectiveConverter = {
  anger: 'mad',
  contempt: 'bitch please',
  disgust: 'do not want',
  fear: 'scared',
  happiness: 'happy',
  neutral: 'chill',
  sadness: 'sad',
  surprise: 'surprised',
  'happiness neutral': 'ok',
  'disgust neutral': 'do not want',
  'neutral sadness': 'meh',
  'happiness sadness': 'idk',
  'happiness surprise': 'excited',
  'anger happiness': 'this is fine',
  'contempt happiness': 'unimpressed',
  'disgust happiness': 'unimpressed',
  'neutral surprise': 'what',
  'anger neutral': 'annoyed',
  'contempt neutral': 'meh'
};

module.exports = function getGifs(data_uri) {

  //turn data uri into a Buffer

  var regex = /^data:.+\/(.+);base64,(.*)$/;

  var matches = data_uri.match(regex)
  var ext = matches[1]
  var data = matches[2]
  var buffer = new Buffer(data, 'base64')

  var emotion;

  var oxfordEmotion = require("node-oxford-emotion")(process.env.EMOTION_KEY);
  return new Promise(function(resolve, reject) {
      oxfordEmotion
        .recognize("image", buffer, function(value) {
          console.log('api returned: ', value);
          resolve(value);
        })
    })
    .then(function(cb) {
      var faceData = JSON.parse(cb)[0].scores;
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

      emotion = adjectiveConverter[topEmotion];
      emotion = emotion ?
        emotion :
        adjectiveConverter[topEmotion.split(' ')[0]];

      console.log('emotion is: ', topEmotion, '-->', emotion);

      return emotion;

    })
    .then(function(emotion) {
      return axios.get('http://api.giphy.com/v1/gifs/search', {
        params: {
          q: emotion,
          api_key: 'dc6zaTOxFJmzC',
          limit: 50
        }
      })
    })
    .then(function(response) {
      return {
        gifList: response.data.data,
        emotion: emotion
      };
    });

}
