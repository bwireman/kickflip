const Driver = require('../driver.js');
const Classes = require('../classes.js');

const numbers = {
    austin: "+12488824432",
    nick: "+12487361831",
    ben: "+18172230083",
    brooke: "+12485348895",
    sieu: "+17347809868"
}

var driver = new Driver.Driver();
var game = new Classes.Game('GameName', numbers.austin, 'Austin', driver.driverEmitter);


test('2 valid players joined, 3 total', () => {
    // Testing joining
    // Valid
    game.onInput('GameName, Nick', numbers.nick);
    game.onInput('GameName   ,    Brooke  ', numbers.brooke);
    expect(game.players.length).toBe(3);
});


test('try invalid joins, 2 valid players joined, 3 total', () => {
    // Invalid
    game.onInput('GameName, NickAgain', numbers.nick);
    game.onInput('WrongName, NickStill', numbers.ben);
    game.onInput('GameName   ,    ', numbers.ben);
    game.onInput('GameName username', numbers.ben);
    expect(game.players.length).toBe(3);
});



test('first question asked', () => {
    // Testing judgeStart
    game.state = 'judgeStart';

    game.onInput('idk', numbers.austin); //judge creates valid question
    expect(game.state).toBe("playerResponses");
    expect(game.question).not.toBe('idk');
    expect(game.question).not.toBe('');
    console.log(game.question);
});



test('all answers in', () => {
    //Testing playerResponses
    game.state = 'playerResponses';
    game.onInput('red', numbers.austin) //judge sends a message
    game.onInput('blue', numbers.brooke) //Brooke sends valid message
    game.onInput('pink', numbers.nick) // Nick sends a valid message
    game.onInput('purps', numbers.nick) //Nick sends another message
    game.onInput('hello', '102375634') //Invalid number
    expect(game.answers.length).toBe(2);
});


test('judged', () => {

    //Testing judging
    game.state = 'judging';
    game.onInput('hello', numbers.austin) //judge sends an invalid message
    game.onInput('1', numbers.brooke) //player sends a valid message
    game.onInput('3', numbers.austin) //judge sends an invalid message
    game.onInput('bleh', numbers.nick) //player sends an invalid message
    game.onInput('heyo', '1234123541')
    game.onInput('1', numbers.austin) //judge sends a valid message
    expect(game.state).toBe("judgeStart")
})


/********  Driver tests  *********/

var args = driver.getArgs(' create MyGameName ,   MyName  ', 'create');
if (args[0] != 'MyGameName') {
    throw new Error('Driver\'s getArgs is wrong');
}
if (args[1] != 'MyName') {
    throw new Error('Driver\'s getArgs is wrong');
}
