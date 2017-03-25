const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));

// Not sure what are these Twilio tokens for yet, just leave them here
const twilioSid = 'AC4f40f7f29e539edbb5e7d1e3c9e66ddd';
const twilioToken = '88e8ec36215e9645adccd41d54c8bbd3';

// The index
app.get('/', function (req, res) {
	res.send('This is the server for Kickflip');
})

// handle POST requests at /text
// the function is called when a new text comes in
app.post('/text', function(req, res) {
	var body = req.body;
	res.send("<Response><Message>Hello</Message></Response>");
})

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
})
