const jokeElement = document.getElementById("joke");
const reloadButton = document.getElementById("reload-btn");
const homeButton = document.getElementById("home-btn");
const statusElement = document.getElementById("status");

// 농담 가져오는 함수
async function fetchJoke() {
  try {
    reloadButton.disabled = true;
    statusElement.textContent = "농담 가져오는 중...";
    jokeElement.textContent = "";

    const response = await fetch("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("응답 에러: " + response.status);
    }

    const data = await response.json();

    jokeElement.textContent = data.joke || "오늘은 농담하고 싶지 않아요...";
    statusElement.textContent = "성공! (status: " + data.status + ")";
  } catch (error) {
    console.error(error);
    jokeElement.textContent = "에러가 발생했어요. 다시 시도해 주세요.";
    statusElement.textContent = "에러: " + error.message;
  } finally {
    reloadButton.disabled = false;
  }
}

reloadButton.addEventListener("click", () => {
  fetchJoke();
  reloadButton.textContent = "다른 농담 보기";
  homeButton.disabled = false;
  homeButton.style.backgroundColor = "#4caf50";
});

homeButton.addEventListener("click", () => {

    jokeElement.textContent = "아빠의 농담이 궁금하신가요?\n아래 버튼을 눌러 보세요!";
    statusElement.textContent = "";
    reloadButton.textContent = "아빠의 농담 보기"
    reloadButton.disabled = false;

    homeButton.disabled = true;
    homeButton.style.backgroundColor = "#87b288ff";
})
