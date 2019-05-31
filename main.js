const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const Driver = require('./driver.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var driver = new Driver.Driver();

// Not sure what are these Twilio tokens for yet, just leave them here
const twilioSid = Driver.twilioInfo.sid;
const twilioToken = Driver.twilioInfo.token;

// The index
app.get('/', function (req, res) {
	//res.send('This is the server for Kickflip');
	res.redirect('https://github.com/bwireman/kickflip');
})

app.get('/logo', function (req, res) {
	res.sendFile(path.join(__dirname + '/kickflipLogo2.png'));
})

// handle POST requests at /text
// the function is called when a new text comes in
app.post('/text', function (req, res) {
	var body = req.body;
	driver.onReceiveText(body);
})

app.listen(3000, function () {
	console.log("Listening on port 3000");
})
