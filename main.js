const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const Driver = require('./driver.js');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));

var driver = new Driver.Driver();

// Not sure what are these Twilio tokens for yet, just leave them here
const twilioSid = 'AC4f40f7f29e539edbb5e7d1e3c9e66ddd';
const twilioToken = '88e8ec36215e9645adccd41d54c8bbd3';

// The index
app.get('/', function (req, res) {
	//res.send('This is the server for Kickflip');
	res.redirect('https://github.com/dudasaus/kickflip');
})

app.get('/logo', function(req, res) {
	res.sendFile(path.join(__dirname+'/kickflipLogo2.png'));
})

// handle POST requests at /text
// the function is called when a new text comes in
app.post('/text', function(req, res) {
	var body = req.body;
	driver.onReceiveText(body);
	/*var twiml = new twilio.TwimlResponse();
	twiml.message('Hello! From your friends at Kickflip!');
	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(twiml.toString());*/
})

app.listen(3000, function () {
	console.log("Listening on port 3000");
})
