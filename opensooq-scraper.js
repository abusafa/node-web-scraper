import { argv } from 'optimist';
import {range} from 'lodash';

var fs      = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient
//var url = 'mongodb://localhost:27017/scraper';
var url = 'mongodb://abusafa:123@ds019063.mlab.com:19063/meteor';

const {
  cat
} = argv;


MongoClient.connect(url, function(err, db) {

  var Posts = db.collection('posts');

  fs.readdir(`./public/${cat}`, (err, files) => {
    files.forEach(file => {
      //console.log(file);

      let content = fs.readFileSync(`./public/${cat}/${file}`, "utf-8");
      var $ = cheerio.load(content);

      $('.rectLi').filter(function(){
        var data = $(this);

        data.each(function(){
          let d = $(this).find('a[data-role="chat-opener"]');
          let title = d.attr('data-post-title');
          let person = d.attr('data-recipient-name');
          let pid = d.attr('data-pid');
          let price = d.attr('data-price');
          let image = d.attr('data-post-img');
          let link = 'https://jo.opensooq.com' + d.attr('data-post-href');



          let location = $(this).find( "ul.rectCatesLinks li:nth-child(1)" ).text()

          let tags = [];
          tags.push(location)
          $(this).find('.rectCatesLinks a').each(function(){
            tags.push($(this).text());
          });

          Posts.insert({cat,title,pid,person,price, link,images:[image],location, tags})

        })
      });

    });
  })
  //MongoClient.close();
  //process.exit()


})
