#!/usr/bin/env node

var cluster = require('cluster'),
	program = require('commander'),
	request = require('request'),
	spawn = require('child_process').spawn,
	urls = [],
	workersPromises = [],
	total = 0,
	iteration = 0,
	i;

program
	.version('0.0.4')
	.option('-i, --iteration [value]', 'iteration count', 100)
	.option('-u, --url [value]', 'url')
	.option('-s, --size [value]', 'block size', 150)
	.option('-t, --timeout [value]', 'delay between batches', 1000)
	.option('-w, --workers [value]', 'workers count', 5)
	.option('-c, --curl [value]', 'use curl', false)
	.parse(process.argv);

if (cluster.isMaster) {
	for (i = 0; i < program.workers; i++) {
		cluster.fork();
	}

	for (i in cluster.workers) {
		workersPromises.push(new Promise(function (resolve) {
			cluster.workers[i].on('message', function (msg) {
				if (msg === 'done') {
					resolve();
				}
			});
		}));
	}

	Promise.all(workersPromises).then(function () {
		console.log('ALL DONE');
		console.log('TOTAL: ', program.workers * program.iteration * program.size);
		console.log('PER SECOND: ', program.workers * (program.size / (program.timeout / 1000)));
		process.exit(0);
	});
} else {
	if (!program.url) {
		console.log('empty url');
	} else {
		urls = program.url.split(',');
		batch();
	}
}

function getUrl() {
	return urls[Math.floor(Math.random() * urls.length)];
}

function batch() {
	var promises = [],
		i;

	console.log('\n\n\n============\n');
	console.log('RUN BATCH');
	console.log('SIZE: %s', program.size);
	console.log('ITERATION: %s OF %s', ++iteration, program.iteration);
	console.log('\n============\n\n\n');

	for (i = 0; i < program.size; i++) {
		promises.push(new Promise(function (resolve) {
			var time = Date.now(),
				url = getUrl(),
				child;

			if (program.curl) {
				child = spawn('curl', [url]);

				if (child.stdout) {
					child.stdout.on('data', function (data) {
						return this;
					});
					child.stdout.on('close', function () {
						console.log('%s: %s - %s ms', ++total, url, Date.now() - time);
						resolve();
					});
				}
			} else {
				request.get(url, function (err, response, body) {
					console.log('%s: %s - %s ms', ++total, url, Date.now() - time);
					resolve();
				});
			}
		}));
	}

	if (iteration < program.iteration) {
		setTimeout(batch, program.timeout);
	} else {
		Promise.all(promises).then(function () {
			process.send('done');
		});
	}
}