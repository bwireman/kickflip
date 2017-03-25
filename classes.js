// Game object
class Game {

     constructor(gameName, phoneNumber, username) {
         this.name = gameName;
         this.creatorPhoneNumber = phoneNumber;

         // stuff
         this.state = 'join';
         this.players = [];
         this.judgeIndex = 0;
         this.answers = [];
		 this.question = '';
         this.addPlayer(phoneNumber, username);
     }

     addPlayer(phoneNumber, username) {
         if (this.isValidNumber(phoneNumber) == 0) {
             this.players.push(new Player(phoneNumber, username));
         }
         // todo already added message? maybe??!???!?!?!
     }

     isValidNumber(phoneNumber) {
         //RETURN INT
         // 0: not in player array
         // 1: normal player (not judge)
         // 2: judge
         for (var i = 0; i < this.players.length; ++i) {
             if (phoneNumber == this.players[i].phoneNumber) {
                 if (i == this.judgeIndex) {
                     return 2;
                 }
                 else {
                     return 1;
                 }
             }
         }
         return 0;
     }

     isCreator(phoneNumber) {
         return phoneNumber == this.creatorPhoneNumber;
     }

     getPlayer(phoneNumber) {
         for (i = 0; i < this.players.length; ++i) {
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

     parseResponse(message, phoneNumber) {

         if (this.isValidNumber(phoneNumber) == 1) {
             if (message.length > 140) {
                 message = message.substr(0, 140);
             }

             this.answers.push(message);
         }

     }

	parseJudging(message, phoneNumber) {
		// checks that phoneNumber is the judge
		if (this.isValidNumber(phoneNumber) == 2) {
			// changes choice into an int, makes sure its valid
			var choice = parseInt(message)
			if (!isNaN(choice)) {
				if (choice < this.players.length) {					 
					this.players[answers[choice].playerIndex].score += 10;
				}
				else {
					// not a valid player choice
				}
			}
			else {
				// not even a number bro
			}
		}
		else {
			// not a valid phone number so ignore that hoe
		}
	}

	parseJudgeStart(message, phoneNumber) {
		if (this.isValidNumber(phoneNumber) == 2) {
			if (message.length > 140) {
				//todo send message to judge, need another question
				console.log("message too long")
			}
			else {
				this.question = message;
				console.log("question recieved, advance to state player response")
				//todo advance state
			}
		}
		else {
			console.log("not judge, please wait for question")
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

module.exports.Game = Game;
