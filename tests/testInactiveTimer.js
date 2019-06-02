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
driver.game = new Classes.Game('GameName', numbers.austin, 'Austin', driver.driverEmitter);

// Testing joining
// Valid
driver.game.onInput('GameName, Nick', numbers.nick);
driver.game.onInput('GameName   ,    Brooke  ', numbers.brooke);

// console.log(driver.game);

// Shorten timer
setTimeout(function() {
}, 2000);

driver.game.pingInactiveTimer(3);
