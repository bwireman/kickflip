// Game object
 class Game {

     constructor(gameName, phoneNumber, username) {
         this.name = name;
         this.creatorPhoneNumber = phoneNumber;

         // stuff
         this.state = '';
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
         for (i = 0; i < this.players.length; ++i) {
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

         }
         else if (this.state == "judgestart") {
		     this.parseJudgeStart(message, phoneNumber);
         }
         else if (this.state == "playerResponses") {

         }
         else if (this.state == "judging") {
		  //todo parse judging
         }
     }
	 
	 
	parseJudging(message, phoneNumber) {
		// checks that phoneNumber is the judge 
		if (this.isValidNumber(phoneNumber) == 2) {
			// changes choice into an int, makes sure its valid 
			var choice = parseInt(message)
			if (!isNaN(choice)) {
				if (choice < this.players.length) {
					this.players[choice].score += 10; 
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
		if (this.isValidNumber == 2) {
			if (message.length > 140) {
				//todo send message to judge, need another question
			}
			else {
				this.question = message;
				//todo advance state
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
