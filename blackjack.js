function drawCard() {
  return Math.floor(Math.random() * 11) + 1;
}

// 플레이어 초기 카드 2장
let playerCards = [drawCard(), drawCard()];
let playerSum = playerCards.reduce((a, b) => a + b, 0);

// 딜러 초기 카드 2장
let dealerCards = [drawCard(), drawCard()];
let dealerSum = dealerCards.reduce((a, b) => a + b, 0);

// 플레이어 판정
if (playerSum === 21) {
  console.log(`Player: ${playerCards.join(", ")} (Total: ${playerSum})`);
  console.log("You win");
  process.exit();
}

if (playerSum > 21) {
  console.log(`Player: ${playerCards.join(", ")} (Total: ${playerSum})`);
  console.log("Dealer wins");
  process.exit();
}

//17 미만
while (dealerSum < 17) {
  dealerCards.push(drawCard());
  dealerSum = dealerCards.reduce((a, b) => a + b, 0);
}

//결과 출력
// console.log(`Player: ${playerCards.join(", ")} (Total: ${playerSum})`);
// console.log(`Dealer: ${dealerCards.join(", ")} (Total: ${dealerSum})`);

//최종 판정
if (dealerSum > 21 && playerSum > 21) {
  console.log("Draw");
} else if (playerSum > 21) {
  console.log("Dealer wins");
} else if (dealerSum > 21) {
  console.log("You win");
} else if (playerSum > dealerSum) {
  console.log("You win");
} else if (dealerSum > playerSum) {
  console.log("Dealer wins");
} else {
  console.log("Draw");
}