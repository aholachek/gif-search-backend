var getReactionGifs = require('./../getReactionGifs');
var expect = require('chai').expect;

var data_uri = require('./data_uri');

var emotion_data = '[{"faceRectangle":{"height":155,"left":158,"top":12,"width":155},"scores":{"anger":0.00147983315,"contempt":6.01639931E-06,"disgust":7.1403636E-05,"fear":0.00021653669,"happiness":0.998070955,"neutral":4.7650432E-05,"sadness":6.096359E-06,"surprise":0.000101511745}}]';

describe("getReactionGifs", function() {

    it("has a function to convert a data uri to a buffer", function() {

        var ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array)).constructor;
        expect(getReactionGifs.dataURIToBuffer(data_uri)).to.be.instanceof(ArrayBufferView);
    });

    it("can send a buffer to the oxford emotion api", function(done){

        getReactionGifs.recognizeImage(getReactionGifs.dataURIToBuffer(data_uri))
        .then(function(value){
          expect(value).to.eql(emotion_data);
          done();
        });
    });

    it("can parse the data from the oxford emotion api into ~internet speak~", function() {

        expect(getReactionGifs.parseEmotionData(emotion_data)).to.eql('happy');
    });

    it("can fetch data from giphy", function(done) {

        getReactionGifs.fetchGiphyData('happy').then(function(data) {
            expect(data[1]).to.eql('happy');
            expect(data[0][0].url).to.be.defined;
            expect(data[0][0].type).to.eql('gif');

            done();
        });

    });

});
