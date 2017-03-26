const pg = require('pg');

const config = {
	host: 'kickflip-questions.csdoow4yvjwg.us-east-2.rds.amazonaws.com',
	database: 'questions',
	user: 'kickflip',
	password: '1440Hubbard',
	port: 5432,
	max: 10
};

class PgDriver {
	constructor(callback) {
		var self = this;

		this.pool = new pg.Pool(config);
		this.pool.connect(function(err, client, done) {
			if (err) {
				return console.error(err);
			}
			self.client = client;
			callback();
		});
	}

	addQuestion(question, callback) {
		this.client.query('insert into questions (question) values ($1)', [question], function(err, result) {
			callback(err, result);
		});
	}
}

module.exports = PgDriver;