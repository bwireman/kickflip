const Driver = require('./driver.js');
const Classes = require('./classes.js');

const numbers = {
    austin: "+12488824432",
    nick: "+12487361831",
    ben: "+18172230083",
    brooke: "+12485348895",
    sieu: "+17347809868"
}

var driver = new Driver.Driver();
var game = new Classes.Game('GameName', numbers.austin, 'Austin', driver.driverEmitter);

// Testing joining
// Valid
game.onInput('GameName, Nick', numbers.nick);
game.onInput('GameName   ,    Brooke  ', numbers.brooke);
// Invalid
game.onInput('GameName, NickAgain', numbers.nick);
game.onInput('WrongName, NickStill', numbers.ben);
game.onInput('GameName   ,    ', numbers.ben);
game.onInput('GameName username', numbers.ben);
// Valid again
game.onInput('GameName, Ben', numbers.ben);
game.onInput('GameName, Sieu', numbers.sieu);

// Start game
game.onInput('STaRt', numbers.austin);


var judgePhoneNumber = game.players[game.judgeIndex].phoneNumber;
var invalidPhoneNumber = game.players[(game.judgeIndex + 1) % game.players.length].phoneNumber;
//invalid judge response
game.onInput('fuckffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', judgePhoneNumber);
game.onInput('im dumb', invalidPhoneNumber) //not judge 
//valid
game.onInput('what is my favorite color', judgePhoneNumber); //judge creates valid question
console.log(game);


//testing responses
//testing responses
game.state = "playerResponses";
game.onInput("austin", numbers.ben);
game.onInput("sieu", numbers.sieu);
game.onInput("brooke", numbers.brooke);
game.onInput("nick", numbers.nick);

console.log(game.state);