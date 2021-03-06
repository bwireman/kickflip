const fs = require('fs');

// Constants
const NOT_PLAYER = 0, PLAYER = 1, JUDGE = 2, MAX_MESSAGE_LENGTH = 140, RESPONSE_TIME = 180, INACTIVE_TIME = 60 * 15, RANDOM_QUESTIONS_JSON_PATH = "random.json";

// Game object
class Game {

    constructor(gameName, phoneNumber, username, driverEmitter = {}, debugMode = true) {
        this.name = gameName;
        this.creatorPhoneNumber = phoneNumber;

        //random Questions info
        let randomQuestions = fs.readFileSync(RANDOM_QUESTIONS_JSON_PATH, { encoding: 'UTF-8' });
        this.randomQuestions = JSON.parse(randomQuestions);

        // stuff
        this.state = 'join';
        this.players = [];
        this.judgeIndex = 0;
        this.answers = [];
        this.question = '';
        this.driverEmitter = driverEmitter;
        this.debugMode = debugMode;
        this.responseTimer = null;
        this.inactiveTimer = null;
        this.addPlayer(phoneNumber, username);
        this.pingInactiveTimer();

    }

    addPlayer(phoneNumber, username) {
        if (this.isValidNumber(phoneNumber) === NOT_PLAYER) {
            this.players.push(new Player(phoneNumber, username));

            if (phoneNumber != this.creatorPhoneNumber) {
                this.sendText(phoneNumber,
                    "Welcome to " + this.name + ", " + username + "!");
                this.sendText(this.creatorPhoneNumber, username + " joined the game!");
                // Ping inactive timer
                this.pingInactiveTimer();
            }



        }
        //TODO: already added message? maybe??!???!?!?!
    }

    sendText(numbers, msg) {
        if (typeof (numbers) === "string") {
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
            if (phoneNumber === this.players[i].phoneNumber) {
                if (i === this.judgeIndex) {
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
        return phoneNumber === this.creatorPhoneNumber;
    }

    getPlayer(phoneNumber) {
        for (var i = 0; i < this.players.length; ++i) {
            if (phoneNumber === this.players[i].phoneNumber) {
                return i;
            }
        }
        return -1;
    }

    onInput(message, phoneNumber) {
        if (phoneNumber === this.creatorPhoneNumber && message.trim().toLowerCase() === '$exit') {
            this.creatorForcedExit();
        }
        // direct program based on its current state
        else if (this.state === "join") {
            return this.parseJoinInput(message, phoneNumber);
        }
        else if (this.getPlayer(phoneNumber) === -1) {
            this.sendText(phoneNumber, "You are not part of the active game");
        }
        else if (this.state === "judgeStart") {
            console.log('calling parse judgeStart');
            this.parseJudgeStart(message, phoneNumber);
        }
        else if (this.state === "playerResponses") {
            this.parseResponse(message, phoneNumber);
        }
        else if (this.state === "judging") {
            //todo parse judging
            console.log('calling parse judgeJudging');
            this.parseJudging(message, phoneNumber);
        }
    }

    // Parsing input functions
    parseJoinInput(msg, number) {
        // check for start
        if (number === this.creatorPhoneNumber) {
            msg = msg.trim().toLowerCase();
            if (msg === 'start') {
                if (this.players.length < 3) { //not enough players to start game
                    this.sendText(this.creatorPhoneNumber, "Not enough players to start.\nRequires at least 3 players\nYou have: " + this.players.length + " players");
                }
                else {
                    // enter player response stage
                    // shuffle players, set judge index to 0
                    this.startGame();
                    // Ping inactive timer
                    this.pingInactiveTimer();
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
                        if (fixedInput.length === 10) {
                            fixedInput = '+1' + fixedInput;
                            tmpPhoneNumbers.push(fixedInput);
                        }
                        else if (fixedInput.length === 11 && fixedInput[0] === '1') {
                            fixedInput = '+' + fixedInput;
                            tmpPhoneNumbers.push(fixedInput);
                        }
                    }
                    // Send invites
                    for (var i = 0; i < tmpPhoneNumbers.length; ++i) {
                        this.sendText(tmpPhoneNumbers[i], "You've been invited to a game of Kickflip! If you want to join, reply \"" + this.name + ", yourName\"");
                    }
                    // return number of invites sent
                    return tmpPhoneNumbers.length;
                }
            }
        }

        // game_name, user_name
        msg = msg.split(",");
        if (msg.length >= 2) {
            var gameName = msg[0].trim().toLowerCase();
            var username = msg[1].trim();
            if (gameName === this.name.toLowerCase()) {
                if (username.length > 0) {
                    this.addPlayer(number, username);
                }
                else {
                    // username was 0 characters?
                    console.log("Username was 0 characters");
                    this.sendText(number, "You didn\'t enter a username!\nRespond with \"" + this.name + ", USERNAME\"");
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
            if (i === this.judgeIndex) {
                this.sendText(this.players[i].phoneNumber, judgeMsg);
            }
            else {
                this.sendText(this.players[i].phoneNumber, playerMsg);
            }
        }
        this.state = 'judgeStart';
        // Ping inactive timer
        this.pingInactiveTimer();
    }

    roundStart() {
        this.state = 'judgeStart';
        var judgeName = this.players[this.judgeIndex].name;
        var playerMsg = `The next round is starting! ${judgeName} is the judge.\n\nWaiting for ${judgeName} to ask a question.`;
        var judgeMsg = `The next round is starting! You are the judge. \n\nRespond with a question for the players, or send idk for a random question.`;

        for (var i = 0; i < this.players.length; i++) {
            if (this.judgeIndex === 0) {
                if (i === this.judgeIndex) {
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
        clearTimeout(this.responseTimer);

        var all_answers = '';

        for (var x = 0; x < this.answers.length; ++x) {
            all_answers += (x + 1) + ") " + this.answers[x].text + "\n";
        }


        //send to all players
        for (var i = 0; i < this.players.length; ++i) {
            if (i != this.judgeIndex) {
                this.sendText(this.players[i].phoneNumber, "The answers are...\n\n" + all_answers + "\nWaiting for the judge to choose the best answer...");
            }
            else {
                this.sendText(this.players[i].phoneNumber, "The answers are...\n\n" + all_answers + "\nRespond with a number to choose the best answer!");
            }
        }


        this.state = "judging";
        // Ping inactive timer
        this.pingInactiveTimer();
    }

    //checks if a , in an answer object has already submitted an answer
    checkForInAnswers(cur_answer) {

        for (var i = 0; i < this.answers.length; ++i) {
            if (cur_answer.playerIndex === this.answers[i].playerIndex) {
                return true;
            }
        }
        return false;
    }

    parseResponse(message, phoneNumber) {
        if (this.isValidNumber(phoneNumber) === PLAYER) {
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
                if (this.answers.length === (this.players.length - 1)) {
                    this.playerResponseToJudging();
                }
            }
            else //if they've already responded
            {
                this.sendText(phoneNumber, "You've already submitted an answer!");
            }

        }

    }

    getRandomQuestion() {
        function randomInt(max) {
            return Math.floor(Math.random() * max + 1);
        }

        return this.randomQuestions.questions[randomInt(this.randomQuestions.length)];
    }

    /** BROOKE'S FUNCTIONS AND STUFF **/

    parseJudging(message, phoneNumber) {
        // checks that phoneNumber is the judge
        if (this.isValidNumber(phoneNumber) === JUDGE) {
            // changes choice into an int, makes sure its valid
            var choice = parseInt(message)
            if (!isNaN(choice)) {
                if (choice - 1 < this.answers.length && choice > 0) {
                    // Round is over, increase judge index
                    this.judgeIndex++;
                    var winningPlayerIndex = this.answers[choice - 1].playerIndex;
                    this.players[winningPlayerIndex].score += 10;

                    if (this.judgeIndex === this.players.length) {
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
                        if (i === this.judgeIndex - 1) {
                            newMsg = prevJudgeMsg;
                        }
                        else if (i === this.judgeIndex) {
                            newMsg = newJudgeMsg;
                        }
                        else {
                            newMsg = playerMsg;
                        }
                        this.sendText(this.players[i].phoneNumber, newMsg);
                    }
                    this.roundEnd();
                    console.log('selected player at index ' + winningPlayerIndex + ' and given them 10 points');
                    // Ping inactive timer
                    this.pingInactiveTimer();
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
        if (this.isValidNumber(phoneNumber) === JUDGE) {
            if (message.length > MAX_MESSAGE_LENGTH) {
                this.sendText(phoneNumber, 'Error: response too long. Please send another message <= 140 characters');
                console.log("message too long");
            }
            else {

                if (message.trim().toLowerCase() === "idk") {
                        this.question = this.getRandomQuestion();
                        this.sendText(phoneNumber, 'You sent: ' + this.question + '\nNow waiting for player responses');
                        this.judgeStartToPlayerResponse(); //advance state
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
            if (this.isValidNumber(phoneNumber) === NOT_PLAYER) {
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
        this.responseTimer = setTimeout(() => {
            this.playerResponseToJudging();
        }, RESPONSE_TIME * 1000);
    }

    roundEnd() {
        this.answers = [];
        if (this.judgeIndex === this.players.length) {
            this.gameOver();
        }
        else {
            // this.judgeIndex++
            // call Austin's function
            this.roundStart();
        }
    }

    gameOver() {
        var winners = [];
        var highscore = -1;

        // Get all the players with the highest score into an array
        for (var i = 0; i < this.players.length; ++i) {
            var p = this.players[i];
            if (p.score > highscore) {
                highscore = p.score;
                winners = [p.name];
            }
            else if (p.score === highscore) {
                winners.push(p.name);
            }
        }

        // Generate winning msg based on number of winners
        if (winners.length === 1) {
            var msg = `The winner is ${winners[0]} with ${highscore} points!`;
        }
        else {
            var msg = "The winners are";
            for (var i = 0; i < winners.length; ++i) {
                if (i === 0) {
                    msg += " " + winners[0];
                }
                else if (i === winners.length - 1) {
                    msg += " and " + winners[i];
                }
                else {
                    msg += ", " + winners[i];
                }
            }
            msg += ` with ${highscore} points each!`;
        }


        for (var i = 0; i < this.players.length; ++i) {
            this.sendText(this.players[i].phoneNumber, msg);
        }
        // Clear timer, kill game
        if (this.inactiveTimer) {
            clearTimeout(this.inactiveTimer);
        }
        this.driverEmitter.emit('gameOver');
        return winners
    }

    /*** INACTIVE TIMER STUFF ***/
    pingInactiveTimer(t = INACTIVE_TIME) {
        if (this.inactiveTimer) {
            clearTimeout(this.inactiveTimer);
        }
        var that = this;
        this.inactiveTimer = setTimeout(() => {
            that.inactiveExit();
        }, t * 1000);
    }

    inactiveExit() {
        if (this.players) {
            for (var i = 0; i < this.players.length; ++i) {
                this.sendText(this.players[i].phoneNumber, "The current game of Kickflip has ended due to inactivity.");
            }
        }
        console.log("Quitting game due to inactivity.");
        console.log(this);
        this.driverEmitter.emit('gameOver');
    }

    checkInactiveTimer() {
        console.log(this.inactiveTimer);
    }

    // Creator forced exit
    creatorForcedExit() {
        if (this.players) {
            for (var i = 0; i < this.players.length; ++i) {
                this.sendText(this.players[i].phoneNumber, "The current game of Kickflip has been closed by the game creator.");
            }
        }
        if (this.responseTimer) {
            clearTimeout(this.responseTimer);
        }
        if (this.inactiveTimer) {
            clearTimeout(this.inactiveTimer);
        }
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
