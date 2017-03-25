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

         }
         else if (this.state == "playerResponses") {
             parseResponse(message, phoneNumber);
         }
         else if (this.state == "judging") {

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
