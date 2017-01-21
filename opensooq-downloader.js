// babel-node opensooq-downloader.js  --count 100 --cat سيارات-ومركبات/شاحنات-اليات-ثقيلة

import { argv } from 'optimist';
import {range} from 'lodash';
import Queue from 'bee-queue';
require('shelljs/global');
var mkdirp = require('mkdirp');

//var queue = new Queue('subtraction');
var queue = new Queue('subtraction', {
  redis: {
    host: 'docker.yeslamo.com'
  }
});


const {
  cat, count=1
} = argv;

range(count).map((item, key)=>{
	queue.createJob(key+1).save()
})

mkdirp.sync(`./public/${cat}`)

queue.process(function (job, done) {
	let j = `wget -q ${encodeURI("https://jo.opensooq.com/ar/"+cat+"?page="+job.data)} -O - | tr '\n' ' ' | grep -o '<ul id="gridPostListing" class="rectangle">.*<div class="mb15 doSaveSearch center">' > public/${cat}/${job.data}.html`
console.log(j);
	setTimeout(()=>{
		exec(j, function(code, stdout, stderr) {
			console.log(code, stdout, stderr);
			done(null, job.data);
		})

	}, 500)
});
