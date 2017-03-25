const Driver = require('./driver.js');
const Classes = require('./classes.js');

// game.sendText(['+12488824432','+12485348895','+18172230083'], 'tests.js');

const numbers = {
    austin: "+12488824432",
    nick: "+12487361831",
    ben: "+18172230083",
    brooke: "+12485348895"
}

var driver = new Driver.Driver();
var game = new Classes.Game('GameName', numbers.austin, 'Austin', driver.driverEmitter);

console.log(game);

// Testing joining
// Valid
game.onInput('GameName, Nick', numbers.nick);
game.onInput('GameName   ,    Brooke  ', numbers.brooke);

// Invalid
game.onInput('GameName, NickAgain', numbers.nick);
game.onInput('WrongName, NickStill', numbers.ben);
game.onInput('GameName   ,    ', numbers.ben);


console.log(game);

// Testing judgeStart
game.state = 'judgeStart';
console.log(game);
game.onInput('what is my favorite color', '123'); //judge creates valid question
game.onInput('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '123');
game.onInput('I want this to be my question', '234');
game.onInput('Im not in the game even', '12489t1235');
//console.log(game);
console.log(game);

//Testing playerResponses
game.state = 'playerResponses';
game.onInput('red', '123') //judge sends a message
game.onInput('blue', '2') //Brooke sends valid message
game.onInput('pink', '234') // Nick sends a valid message
game.onInput('purps', '234') //Nick sends another message
game.onInput('hello', '102375634') //Invalid number
console.log(game);

//Testing judging
game.state = 'judging';
console.log(game);
game.onInput('hello', '123') //judge sends an invalid message
game.onInput('1', '2') //player sends a valid message
game.onInput('1', '123') //judge sends a valid message
game.onInput('3', '123') //judge sends an invalid message
game.onInput('bleh', '234') //player sends an invalid message
console.log(game);


/********  Driver tests  *********/

var args = driver.getArgs(' create MyGameName ,   MyName  ', 'create');
if (args[0] != 'MyGameName') {
	throw new Error('Driver\'s getArgs is wrong');
}
if (args[1] != 'MyName') {
	throw new Error('Driver\'s getArgs is wrong');
}
