const PgDriver = require('./db/PgDriver.js');

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

         //db driver
         this.pgDriver = new PgDriver(function() {});
     }

     addPlayer(phoneNumber, username) {
         if (this.isValidNumber(phoneNumber) == NOT_PLAYER) {
             this.players.push(new Player(phoneNumber, username));

             if(phoneNumber != this.creatorPhoneNumber)
             {
                 this.sendText(phoneNumber,
                 "Welcome to " + this.name + ", " + username + "!");
                 this.sendText(this.creatorPhoneNumber,username + " joined the game!");
             }



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
         else if (this.getPlayer(phoneNumber) == -1) {
             this.sendText(phoneNumber, "You are not part of the active game \n\n #cock_blocked");
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
				 if (this.players.length < 3) { //not enough players to start game
					this.sendText(this.creatorPhoneNumber, "Not enough players to start.\nRequires at least 3 players\nYou have: " + this.players.length + " players");
				 }
				 else {
					// enter player response stage
					// shuffle players, set judge index to 0
					this.startGame();
				 }
                 return;
             }
             else {
                 var invite = 'invite'
                 msg = msg.trim().toLowerCase();
                 if (msg.substr(0, invite.length)) {
                     msg = msg.substr(invite.length);
                     var inputNumbers = msg.split(',');
                     var tmpPhoneNumbers = [];
                     // Get all of the valid phone numbers from invite command
                     for (var i = 0; i < inputNumbers.length; ++i) {
                        //  inputNumbers[i] = inputNumbers[i].trim();
                        var fixedInput = '';
                        for (var j = 0; j < inputNumbers[i].length; ++j) {
                            if (inputNumbers[i][j] >= '0' && inputNumbers[i][j] <= '9') {
                                fixedInput += inputNumbers[i][j];
                            }
                        }
                        if (fixedInput.length == 10) {
                            fixedInput = '+1' + fixedInput;
                            tmpPhoneNumbers.push(fixedInput);
                        }
                        else if (fixedInput.length == 11 && fixedInput[0] == '1') {
                            fixedInput = '+' + fixedInput;
                            tmpPhoneNumbers.push(fixedInput);
                        }
                     }
                     // Send invites
                     for (var i = 0; i < tmpPhoneNumbers.length; ++i) {
                         this.sendText(tmpPhoneNumbers[i], "You've been invited to a game of Kickflip! If you want to join, reply \"" + this.name + ", yourName\"");
                     }
                     return;
                 }
             }
         }

         // game_name, user_name
         msg = msg.split(",");
         if (msg.length >= 2) {
             var gameName = msg[0].trim().toLowerCase();
             var username = msg[1].trim();
             if (gameName == this.name.toLowerCase()) {
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
         var judgeMsg = "The game is starting! The players are\n" + playerList + "You are the first judge. \n\nRespond with a question for the players, or send idk for a random question.";

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
         var judgeMsg = `The next round is starting! You are the judge. \n\nRespond with a question for the players, or send idk for a random question.`;

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
                 this.sendText(this.players[i].phoneNumber, "The answers are...\n\n" + all_answers +"\nWaiting for the judge to choose the best answer...");
             }
             else {
                 this.sendText(this.players[i].phoneNumber, "The answers are...\n\n" + all_answers + "\nRespond with a number to choose the best answer!");
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
             else //if they've already responded
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
                        var newJudgeMsg = `The judge selected "${this.answers[choice - 1].text}" and gave them 10 points\n\nThe next round is starting! You are the judge.\n\nRespond with a question for the players, or send idk for a random question`;
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
				this.sendText(phoneNumber, 'Error: response too long. Please send another message <= 140 characters');
				console.log("message too long");
			}
			else {

			    if(message.trim().toLowerCase() == "idk") {
                    var self = this;
			        this.pgDriver.getRandomQuestion(function(question) {
                        self.question = question;
                        self.sendText(phoneNumber, 'You sent: ' + question + '\n Now waiting for player responses');
                        self.judgeStartToPlayerResponse(); //advance state

                    });
			        console.log("asked for a random question, advance to state player response")
			    } else {
			        this.question = message;
			        console.log("question received, advance to state player response")
    			    this.sendText(phoneNumber, 'Question received, now wait for player responses');
    			    this.judgeStartToPlayerResponse(); //advance state
                }
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
	    var tie = false;
		var max = 0;
		var winnerName;
		var winnersNameTie; //trust me we need this
		for (var i = 0; i < this.players.length; ++i) {
			if (this.players[i].score > max) {
				max = this.players[i].score
				winnerName = this.players[i].name
				winnersNameTie = "";
				tie = false;
			} else if (max == this.players[i].score) {
			    tie = true;
			    winnersNameTie += this.players[i].name + " ";
			}

		}

		var gameScoreboard = "Game over!\nName   Score\n";

		for (var i = 0; i < this.players.length; ++i) {
		    gameScoreboard += this.players[i].name + "   " + this.players[i].score + "\n";
		}

		if(!tie) {
		    gameScoreboard += 'The winner is ' + winnerName + ' with ' + max + " points!\n"
		    gameScoreboard += winnerName + " is the Kickflip king!"
		} else {
		    gameScoreboard += 'The winners are ' + winnersNameTie + ' with ' + max + " points each!\n"
		}



		for (var i = 0; i < this.players.length; ++i) {
			this.sendText(this.players[i].phoneNumber, gameScoreboard);
		}
		//todo send event emitter to driver function and clear memory and shiz
        this.driverEmitter.emit('gameOver');
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
