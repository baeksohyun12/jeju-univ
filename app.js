/*const startingPokerChips = 100;
const players = 3;
const noOfStarterCards = 2;
let gameHasEnded = false;

let playerOneName = "Chloe";
let playerTwoName = "Jasmine";
let playerThreeName = "Jen";

console.log(`welcome! 챔피언십 타이틀은 ${playerOneName}, ${playerTwoName}, ${playerThreeName} 중 한 명에게 주어집니다. 흥미진진한 경기가 될 것입니다. 최고의 선수가 승리하길 바랍니다.`);

let playerOnePoints = startingPokerChips;
let playerTwoPoints = startingPokerChips;
let playerThreePoints = startingPokerChips;

playerOnePoints -= 50;
playerTwoPoints -= 25;
playerThreePoints += 75;

gameHasEnded = ((playerOnePoints + playerTwoPoints) == 0) ||
    ((playerTwoPoints + playerThreePoints) == 0) ||
    ((playerOnePoints + playerThreePoints) == 0);

console.log("게임이 종료되었습니다 : ", gameHasEnded);

*/
function displayGreeting(name, salutation) {
    const message = `Hello, ${name}!`;
    console.log(message);
}

displayGreeting('Christopher');