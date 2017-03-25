// Constants
const NOT_PLAYER = 0, PLAYER = 1, JUDGE = 2, MAX_MESSAGE_LENGTH = 140;

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
             this.sendTextWithDebug(numbers, msg);
         }
         else {
             for (var i = 0; i < numbers.length; ++i) {
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

             //if we have all the answers (todo timer eventually)
             if(this.answers.length == (this.players.length - 1)) {
                 this.playerResponseToJudging();
             }
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
                 this.startGame();
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
                     this.sendText(number, "You didn\'t enter a username!\nRespond with \""+ this.name +", USERNAME\"");
                 }
             }
         }
         else {
             // wasn't the right format
             console.log("message had the wrong format");
             this.sendText(number, "Wrong format! Respond with \"" + this.name + ", USERNAME\"");
         }
     }

     startGame() {
         shuffleArray(this.players);
         this.judgeIndex = 0;
         var judgeName = this.players[this.judgeIndex].name;
         var playerMsg = `The game is starting! ${judgeName} is the first judge.\n\n
            Waiting for ${judgeName} to ask a question.`;
         var judgeMsg = `The game is starting! You are the first judge. \n\n
            Respond with a question for the players.`;

        for (var i = 0; i < players.length; i++) {
            if (i == this.judgeIndex) {
                sendText(this.players[i].phoneNumber, judgeMsg);
            }
            else {
                sendText(this.players[i].phoneNumber, playerMsg);
            }
        }
        this.state = 'judgeStart';
        //roundStart(false);
     }

     roundStart() {
         this.state = 'judgeStart';
         var judgeName = this.players[this.judgeIndex].name;
         var playerMsg = `The next round is starting! ${judgeName} is the judge.\n\n
            Waiting for ${judgeName} to ask a question.`;
         var judgeMsg = `The next round is starting! You are the judge. \n\n
            Respond with a question for the players.`;

        for (var i = 0; i < players.length; i++) {
            if (i == this.judgeIndex) {
                sendText(this.players[i].phoneNumber, judgeMsg);
            }
            else {
                sendText(this.players[i].phoneNumber, playerMsg);
            }
        }
     }

     playerResponseToJudging () {
         this.state = "judging";
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
             this.sendText(phoneNumber, "The question is \"" +  this.question + "\" \n please answer");
             //makes answer object
             var cur_answer = new Answer;
             cur_answer.playerIndex = this.getPlayer(phoneNumber);
             //if they haven't submited an answer yet
             if (!(this.checkForInAnswers(cur_answer))) {

                 //cuts answer down if larger than 140 chars
                 if (message.length > MAX_MESSAGE_LENGTH) {
                     message = message.substr(0, MAX_MESSAGE_LENGTH);
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
					var winningPlayerIndex = this.answers[choice - 1].playerIndex;
					this.players[winningPlayerIndex].score += 10;
					var winnerName = this.players[winningPlayerIndex].name;
					for (var i = 0; i < this.players.length; ++i) {
							this.sendText(this.players[i].phoneNumber, 'The judge selected ' + winnerName + ' and gave them 10 points');
					}
					this.roundEnd(); 
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
		if (this.isValidNumber(phoneNumber) == JUDGE) {
			if (message.length > MAX_MESSAGE_LENGTH) {
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
			if (this.isValidNumber(phoneNumber) == NOT_PLAYER) {
				this.sendText(phoneNumber, 'You are not in this game...')
			}
			else {
				this.sendText(this.players[this.getPlayer(phoneNumber)], 'You are not the current judge, please wait for judge to send question');
				console.log("not judge, please wait for question")
			}
		}

	}
	roundEnd() {
		if (this.judgeIndex == this.players.length - 1) {
			var max = 0;
			var winnerName; 
			for (var i = 0; i < this.players.length; ++i) {
				if (this.players[i].score > max) {
					max = this.players[i].score
					winnerName = this.players[i].name
				}
			}
			for (var i = 0; i < this.players.length; ++i) {
				this.sendText(this.players[i].phoneNumber, 'Game over! The winner is ' + winnerName + ' with ' + max + ' points!');
			}
		}
		else {
			this.judgeIndex++
			// call Austin's function 
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

function shuffleArray(array) {
    function randomInt(max) {
        return Math.floor(Math.random() * max + 1);
    }

    for (var i = 0; i < array.length - 1; i++) {
        var random = randomInt(array.length - i - 1);
        var temp = array[i];
        array[i] = array[i + random];
        array[i + random] = temp;
    }
}

// Exports
module.exports.Game = Game;
module.exports.shuffleArray = shuffleArray;
