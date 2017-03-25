// Constants
const NOT_PLAYER = 0, PLAYER = 1, JUDGE = 2, MAX_MESSAGE_LENGTH = 140, RESPONSE_TIME = 180;

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
         this.timer = {};
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
                 return;
             }
         }
		 
		 // check for invites
		 if (number == this.creatorPhoneNumber) {
			msg = msg.trim(); // 2487897243,1234567890,
			var inviteNumbers = [];
			var numberDigits = 0;
			while (msg.length > 9) {				
				var tempNumber = "+1" + msg.substr(0, 10);
				inviteNumbers.push(tempNumber);	
				msg = msg.slice(11, msg.length);
				msg = msg.trim();
			}
			for (var i = 0; i < inviteNumbers.length; ++i) {
				this.sendText(inviteNumbers[i], "You've been invited to the game! If you want to join, send back \"" + this.name + "\", \"yourname\" without quotes.");
			}
			return;
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
		 var playerList = '';
		 for (var i = 0; i < this.players.length; ++i) {
			 playerList += this.players[i].name;
			 playerList += '\n'
		 }
         var playerMsg = "The game is starting! The players are\n" + playerList + `${judgeName} is the first judge.\n\nWaiting for ${judgeName} to ask a question.`;
         var judgeMsg = "The game is starting! The players are\n" + playerList + "You are the first judge. \n\nRespond with a question for the players.";

        for (var i = 0; i < this.players.length; i++) {
            if (i == this.judgeIndex) {
                this.sendText(this.players[i].phoneNumber, judgeMsg);
            }
            else {
                this.sendText(this.players[i].phoneNumber, playerMsg);
            }
        }
        this.state = 'judgeStart';
     }

     roundStart() {
         this.state = 'judgeStart';
         var judgeName = this.players[this.judgeIndex].name;
         var playerMsg = `The next round is starting! ${judgeName} is the judge.\n\nWaiting for ${judgeName} to ask a question.`;
         var judgeMsg = `The next round is starting! You are the judge. \n\nRespond with a question for the players.`;

        for (var i = 0; i < this.players.length; i++) {
			if (this.judgeIndex == 0) {
				if (i == this.judgeIndex) {
					this.sendText(this.players[i].phoneNumber, judgeMsg);
				}
				else {
					this.sendText(this.players[i].phoneNumber, playerMsg);
				}
			}
        }
     }

     /** BEN'S FUNCTIONS AND STUFF **/

     playerResponseToJudging() {
         shuffleArray(this.answers);
         clearTimeout(this.timer);

         var all_answers = '';

         for(var x = 0; x < this.answers.length; ++x) {
             all_answers += (x+1) + ") "  + this.answers[x].text + "\n";
         }


         //send to all players
         for(var i = 0; i < this.players.length; ++i) {
             if (i != this.judgeIndex) {
                 this.sendText(this.players[i].phoneNumber, "The answers are...\n\n" + all_answers);
             }
             else {
                 this.sendText(this.players[i].phoneNumber, "The answers are...\n\n" + all_answers + "\n Respond with a number to choose the best answer!");
             }
         }


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

                 //if we have all the answers (todo timer eventually)
                 if(this.answers.length == (this.players.length - 1)) {
                     this.playerResponseToJudging();
                 }
             }
             else//if they've already responded
             {
                 this.sendText(phoneNumber, "You've already submitted an answer!");
             }

         }

     }

     /** BROOKE'S FUNCTIONS AND STUFF **/

	parseJudging(message, phoneNumber) {
		// checks that phoneNumber is the judge
		if (this.isValidNumber(phoneNumber) == JUDGE) {
			// changes choice into an int, makes sure its valid
			var choice = parseInt(message)
			if (!isNaN(choice)) {
				if (choice - 1 < this.answers.length && choice > 0) {
                    // Round is over, increase judge index
                    this.judgeIndex++;
                    var winningPlayerIndex = this.answers[choice - 1].playerIndex;
                    this.players[winningPlayerIndex].score += 10;

                    if (this.judgeIndex == this.players.length) {
                        // judging + end game text
                        var playerMsg = `The judge selected "${this.answers[choice - 1].text}" and gave them 10 points`;
                        var prevJudgeMsg = `You selected "${this.answers[choice - 1].text}" and gave them 10 points`;
                        var newJudgeMsg = playerMsg;
                    }
                    else {
                        // judging + next round text
                        var newJudgeName = this.players[this.judgeIndex].name;
                        var playerMsg = `The judge selected "${this.answers[choice - 1].text}" and gave them 10 points\n\nThe next round is starting! ${newJudgeName} is the judge.\n\nWaiting for ${newJudgeName} to ask a question.`;
                        var prevJudgeMsg = `You selected "${this.answers[choice - 1].text}" and gave them 10 points\n\nThe next round is starting! ${newJudgeName} is the judge.\n\nWaiting for ${newJudgeName} to ask a question.`;
                        var newJudgeMsg = `The judge selected "${this.answers[choice - 1].text}" and gave them 10 points\n\nThe next round is starting! You are the judge.\n\nRespond with a question for the players.`;
                    }
                    for (var i = 0; i < this.players.length; ++i) {
                        var newMsg;
                        if (i == this.judgeIndex - 1) {
                            newMsg = prevJudgeMsg;
                        }
                        else if (i == this.judgeIndex) {
                            newMsg = newJudgeMsg;
                        }
                        else {
                            newMsg = playerMsg;
                        }
                        this.sendText(this.players[i].phoneNumber, newMsg);
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
			this.sendText(phoneNumber, "You\'re not the judge!");
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
				console.log("question received, advance to state player response")
				this.sendText(phoneNumber, 'Question received, now wait for player responses');
				this.judgeStartToPlayerResponse(); //advance state
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

	judgeStartToPlayerResponse() {
		this.state = 'playerResponses';
		for (var i = 0; i < this.players.length; ++i) {
			if (i != this.judgeIndex) {
				this.sendText(this.players[i].phoneNumber, 'The question is: ' + this.question + '\nPlease send your responses for judging.');
			}
		}
		//todo start timer
        this.timer = setTimeout( () => {
            this.playerResponseToJudging();
        }, RESPONSE_TIME * 1000);
	}

	roundEnd() {
        this.answers = [];
		if (this.judgeIndex == this.players.length) {
			this.gameOver();
		}
		else {
			// this.judgeIndex++
			// call Austin's function
			this.roundStart();
		}
	}

	gameOver() {
		var max = 0;
		var winnerName;
		for (var i = 0; i < this.players.length; ++i) {
			if (this.players[i].score > max) {
				max = this.players[i].score
				winnerName = this.players[i].name
			}
		}

		var gameScoreboard = "Game over!\nName   Score\n";

		for (var i = 0; i < this.players.length; ++i) {
		    gameScoreboard += this.players[i].name + "   " + this.players[i].score + "\n";
		}
		gameScoreboard += 'The winner is ' + winnerName + ' with ' + max + " points!\n"
		gameScoreboard += winnerName + " is the Kickflip king!"

		for (var i = 0; i < this.players.length; ++i) {
			this.sendText(this.players[i].phoneNumber, gameScoreboard);
		}
		//todo send event emitter to driver function and clear memory and shiz
	}
 } //end of game object


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
