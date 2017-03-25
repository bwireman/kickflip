const Game = require('./classes.js');

const CREATE_COMMAND = 'create';

class Driver {
	constructor() {
		this.game = null;
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

		text = text.trim();
		text = text.substr(CREATE_COMMAND.length);
		text = text.trim();
		args = text.split(',');

		this.game = new Game(args[0], senderNumber, args[1].trim());
	}

	getCommand(text) {
		text = text.trim().toLowerCase();
		return text.split(' ')[0];
	}
}

module.exports = Driver;