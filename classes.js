// Constants
const NOT_PLAYER = 0, PLAYER = 1, JUDGE = 2;

// Game object
class Game {

     constructor(gameName, phoneNumber, username, driverEmitter = {}, debugMode = true) {
         this.name = gameName;
         this.creatorPhoneNumber = phoneNumber;

         // stuff
         this.state = 'join';
         this.players = [];
         this.judgeIndex = 0;
         this.answers = [];
		 this.question = '';
         this.driverEmitter = driverEmitter;
         this.debugMode = debugMode;
         this.addPlayer(phoneNumber, username);
     }

     addPlayer(phoneNumber, username) {
         if (this.isValidNumber(phoneNumber) == NOT_PLAYER) {
             this.players.push(new Player(phoneNumber, username));
             this.sendText(phoneNumber,
             "Welcome to " + this.name + ", " + username + "!");
         }
         // todo already added message? maybe??!???!?!?!
     }

     // sendText(phoneNumber, msg);
     // sendText(phoneNumber array, msg);
     sendText(numbers, msg) {
		 console.log(typeof(numbers));
         if (typeof(numbers) == "string") {
             //this.driverEmitter.emit('sendText', numbers, msg);
             this.sendTextWithDebug(numbers, msg);
         }
         else {
             for (var i = 0; i < numbers.length; ++i) {
                //  this.driverEmitter.emit('sendText', numbers[i], msg);
                this.sendTextWithDebug(numbers[i], msg);
             }
         }
     }
     sendTextWithDebug(number, msg) {
         if (this.debugMode) {
             console.log("To: " + number + "\nMessage: " + msg + "\n---");
         }
         else {
             this.driverEmitter.emit('sendText', number, msg);
         }
     }

     isValidNumber(phoneNumber) {
         //RETURN INT
         // 0: not in player array
         // 1: normal player (not judge)
         // 2: judge
         for (var i = 0; i < this.players.length; ++i) {
             if (phoneNumber == this.players[i].phoneNumber) {
                 if (i == this.judgeIndex) {
                     return JUDGE;
                 }
                 else {
                     return PLAYER;
                 }
             }
         }
         return NOT_PLAYER;
     }

     isCreator(phoneNumber) {
         return phoneNumber == this.creatorPhoneNumber;
     }

     getPlayer(phoneNumber) {
         for (var i = 0; i < this.players.length; ++i) {
             if (phoneNumber == this.players[i].phoneNumber) {
                 return i;
             }
         }
         return -1;
     }

     onInput(message, phoneNumber) {
         // direct program based on its current state
         if (this.state == "join") {
             this.parseJoinInput(message, phoneNumber);
         }
         else if (this.state == "judgeStart") {
			 console.log('calling parse judgeStart');
		     this.parseJudgeStart(message, phoneNumber);
         }
         else if (this.state == "playerResponses") {
             this.parseResponse(message, phoneNumber);
         }
         else if (this.state == "judging") {
		  //todo parse judging
			 console.log('calling parse judgeJudging');
			 this.parseJudging(message, phoneNumber);
         }
     }

     // Parsing input functions
     parseJoinInput(msg, number) {
         // check for start
         if (number == this.creatorPhoneNumber) {
             msg = msg.trim().toLowerCase();
             if (msg == 'start') {
                 // enter player response stage
                 // shuffle players, set judge index to 0
             }
         }


         // game_name, user_name
         msg = msg.split(",");
         if (msg.length >= 2) {
             var gameName = msg[0].trim();
             var username = msg[1].trim();
             if (gameName == this.name) {
                 if (username.length > 0) {
                     this.addPlayer(number, username);
                 }
                 else {
                     // username was 0 characters?
                     console.log("Username was 0 character");
                 }
             }
         }
         else {
             // wasn't the right format
             console.log("message had the wrong format");
         }

     }

    //checks if a , in an answer object has already submitted an answer
     checkForInAnswers (cur_answer) {

         for (var i = 0; i < this.answers.length; ++i) {
             if (cur_answer.playerIndex == this.answers[i].playerIndex) {
                 return true;
             }
         }
         return false;
     }

     parseResponse (message, phoneNumber) {

         if (this.isValidNumber(phoneNumber) == PLAYER) {

             //makes answer object
             var cur_answer = new Answer;
             cur_answer.playerIndex = this.getPlayer(phoneNumber);
             //if they haven't subumited an answer yet
             if (!(this.checkForInAnswers(cur_answer))) {

                 //cuts answer down if larger than 140 chars
                 if (message.length > 140) {
                     message = message.substr(0, 140);
                 }

                 //pushes to the answers array
                 cur_answer.text = message;
                 this.answers.push(cur_answer);
             }

         }

     }

	parseJudging(message, phoneNumber) {
		// checks that phoneNumber is the judge
		if (this.isValidNumber(phoneNumber) == JUDGE) {
			// changes choice into an int, makes sure its valid
			var choice = parseInt(message)
			if (!isNaN(choice)) {
				if (choice - 1 < this.answers.length && choice > 0) {
					//choice -= 1;
					var winningPlayerIndex = this.answers[choice].playerIndex;
					this.players[winningPlayerIndex].score += 10;
					var winnerName = players[winningPlayerIndex].name; 
					for (var i = 0; i < this.players.length; ++i) {
							this.sendText(this.players[i].phoneNumber, 'The judge selected ' + winnerName + ' and gave them 10 points');
					}	
					console.log('selected player at index ' + winningPlayerIndex + ' and given them 10 points');
				}
				else {
					this.sendText(phoneNumber, 'Please send a valid choice')
					console.log('choice is not valid')
				}
			}
			else {
				this.sendText(phoneNumber, 'Please send a valid choice')
				console.log('please send a valid choice')
			}
		}
		else {
			this.sendText(phoneNumber, 'The answer must come from the judge')
			console.log('phonenumber not in players[] or phonenumber not judge')
		}
	}

	parseJudgeStart(message, phoneNumber) {
		if (this.isValidNumber(phoneNumber) == 2) {
			if (message.length > 140) {				
				this.sendText(phoneNumber, 'Error: response too long. Please send another message < 140 characters');
				console.log("message too long");
			}
			else {
				this.question = message;
				console.log("question recieved, advance to state player response")
				this.sendText(phoneNumber, 'Question recieved, now wait for player responses');
				//todo advance state
			}
		}
		else {
			if (this.isValidNumber(phoneNumber) == 0) {
				this.sendText(phoneNumber, 'You are not in this game...')
			}
			else {
				this.sendText(this.players[this.getPlayer(phoneNumber)], 'You are not the current judge, please wait for judge to send question');
				console.log("not judge, please wait for question")
			}
		}
		
	}
 } //end of game object

 /*
new game text: create GAME_NAME, MY_NAME
 */

// Player object
class Player {
    constructor(phoneNumber, name) {
        this.phoneNumber = phoneNumber;
        this.name = name;
        this.score = 0;
    }
}

// Answer object
class Answer {
    constructor(playerIndex, text) {
        this.playerIndex = playerIndex;
        this.text = text;
    }
}

// Exports
module.exports.Game = Game;
