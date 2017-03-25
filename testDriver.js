const Driver = require('./driver.js');

var driver = new Driver.Driver();

driver.driverEmitter.emit('sendText', '+12488824432', 'test');
