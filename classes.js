// Game object
 class Game {
     state = '';
     name = '';
     creatorPhoneNumber = '';
     players = [];
     judgeIndex = 0;
     answers = [];

     constructor(gameName, phoneNumber, username) {
         this.name = name;
         this.creatorPhoneNumber = phoneNumber;
         this.addPlayer(phoneNumber, username);
     }

     addPlayer(phoneNumber, username) {
         this.players.push(new Player(phoneNumber, username));
         // if player limit check stuff here
         // check if number already exists
     }
 }

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
