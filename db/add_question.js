const PgDriver = require('./PgDriver.js');

if (process.argv.length < 3) {
	console.log("Please specify a question you wanna add");
	process.exit();
}

driver = new PgDriver(function(client) {
	question = process.argv[2];
	for (var i = 3; i < process.argv.length; i++) {
		question += ' ' + process.argv[i];
	}

	client.query('insert into questions (question) values ($1)', [question], function(err, result) {
		client.end();
		process.exit();
	});
});