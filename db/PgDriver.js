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

	getRandomQuestion(callback) {
		var self = this;

		this.client.query('select count(*) from questions;',
					[], function(err, result) {
			var count = result.rows[0].count;
			var random = Math.floor(Math.random() * count + 1);

			self.client.query('select question from questions where id=$1',
					[random], function(err, result) {
				if (err) {
					return console.error(err);
				}

				callback(result.rows[0].question);
			})
		});
	}
}

module.exports = PgDriver;