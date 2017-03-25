const Classes = require('./classes.js');

var game = new Classes.Game('GameName', '123', 'Username');

console.log(game);

// Testing joining
// Valid
game.onInput('GameName, Nick', '234');
game.onInput('GameName   ,    Brooke  ', '2');

// Invalid
game.onInput('GameName, NickAgain', '234');
game.onInput('WrongName, NickStill', '231');
game.onInput('GameName   ,    ', '2');


console.log(game);

//Testing judgeStart
game.state = 'judgeStart';
console.log(game);
game.onInput('what is my favorite color', '123'); //judge creates valid question
game.onInput('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '123');
game.onInput('I want this to be my question', '234'); 
game.onInput('Im not in the game even', '12489t1235');
console.log(game);

//Testing judging
game.state = 'judging';
console.log(game.state);
			  