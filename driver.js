const Game = require('./classes.js');
const EventEmitter = require('events');

const CREATE_COMMAND = 'create';

class DriverEmitter extends EventEmitter {}

class Driver {
	constructor() {
		this.game = null;
        this.driverEmitter = new DriverEmitter;

        this.driverEmitter.on('sendText', sendText);
	}

	onReceiveText(body) {
		var command = this.getCommand(body.Body);

		if (command == CREATE_COMMAND) {
			onReceiveCreate(body);
		}
	}

	onReceiveCreate(body) {
		var text = body.Body;
		var senderNumber = body.From;

		// A game is already in place
		// Maybe send back a text or something here
		if (this.game) {
			return;
		}

		var args = this.getArgs(text, CREATE_COMMAND);

		this.game = new Game(args[0], senderNumber, args[1]);
	}

	getCommand(text) {
		text = text.trim().toLowerCase();
		return text.split(' ')[0];
	}

	getArgs(text, command) {
		text = text.trim();
		text = text.substr(command.length);
		text = text.trim();

		var args = text.split(',');
		for (var i = 0; i < args.length; i++) {
			args[i] = args[i].trim();
		}

		return args;
	}


}

// Twilio stuff
const twilioSid = 'AC4f40f7f29e539edbb5e7d1e3c9e66ddd';
const twilioToken = '88e8ec36215e9645adccd41d54c8bbd3';
const twilioNumber = '+17344186484';
const twilio = require('twilio');
const client = new twilio.RestClient(twilioSid, twilioToken);

function sendText(phoneNumber, msg) {
    console.log('sending text...');
    client.messages.create({
        body: msg,
        to: phoneNumber,
        from: twilioNumber
    }, (err, msg) => {
        if (err) {
            console.log('Error sending message: ' + err.message);
        }
    })
}

module.exports.Driver = Driver;
