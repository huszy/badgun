const express = require('express');
const request = require('request');
const path = require('path');
const bodyParser = require('body-parser');

const server = express();
const fs = require('fs')

// Check to see if ENV Variable PORT  is set, defaults to 9090
const port = process.env.PORT || 9090;
const liveDir = path.join(__dirname, 'assets');

server.use(express.static(liveDir));

server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

server.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'utils/tileeditor/index.html'));
});

server.get("/stageElements.json", function(req, res, next) {
    res.sendFile(path.join(__dirname, 'utils/stageElements.json'));
});

server.post('/stageElements.json', function(req, res) {
	let fields = req.body;
	fs.writeFile(path.join(__dirname, 'utils/stageElements.json'), JSON.stringify(fields, null, 2), {}, function (err) {
    if (err != null) {
			res.status(500).send('Error saving stageElements')
    } else {
			res.status(200).send('Ok')
		}
  })
})

server.get("/*", function(req, res, next) {
	//console.log(req)
	res.sendFile(path.join(__dirname, 'utils/tileeditor', req.url));
});


// Listen for connections
server.listen(port, function() {
	console.log('Listening on ' + port);
});
