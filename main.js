import { units } from "./units.js";
import { data } from "./questions.js";

// ボタンと出力先の要素を取得
const btnShow = document.getElementById("btnShow");
const output = document.getElementById("output");
const btnStop = document.getElementById("btnStop");
const modeCompetitive = JSON.parse(localStorage.getItem("modeCompetitive") || "false");

let isClicked = false;
let clickedTime = null;

if (modeCompetitive) {
    btnShow.textContent = "スタート";
    btnShow.style.backgroundColor = "#ff4a4a";
    btnShow.style.borderColor = "#ff2b2b";
}

// 出題ボタンがクリックされたときの処理
btnShow.addEventListener("click", () => {
    if (modeCompetitive) {
        if (isClicked) return; // 競技モード時2回目以降無効
        isClicked = true;
        btnShow.textContent = "出題中";
        btnShow.style.backgroundColor = "#adadad";
        btnShow.style.borderColor = "#7f7f7f";
        clickedTime = Date.now();
        console.log(clickedTime);
        btnStop.style.visibility = "visible";
    }
    // ローカルストレージから一覧を取得
    const enableUnits = JSON.parse(localStorage.getItem("enableUnits") || "[]");

    // 有効な問題だけをunitsから抽出
    const filteredUnits = units.filter(unit => enableUnits.includes(String(unit.id)));

    // 単元が1つも選択されていない場合はエラーメッセージを表示
    if (filteredUnits.length === 0) {
        output.innerHTML = `<div class="error-message">単元を選択してください。</div>`;
        output.style.visibility = "visible";
        output.style.opacity = 1;
        return;
    }

    // 選ばれた単元すべての問題数の合計を計算
    let sum = 0;
    for (let i of filteredUnits) {
        sum += i.num;
    }

    // 1〜合計問題数までの乱数を生成する関数
    function getRandomInt() {
        return Math.floor(Math.random() * sum) + 1;
    }

    // 出題する問題番号をランダムに決定
    const question = getRandomInt();

    // どの単元に属する問題かを決定するための変数
    let total = 0;
    let index = null;
    let number = 0;

    // ランダムに決まった問題番号がどの単元に属するかを探索
    for (let unit of filteredUnits) {
        total += unit.num;
        if (total >= question) {
            total -= unit.num;
            index = unit;
            number = question - total;
            break;
        }
    }

    const questions = data.questions[index.id];
    const pages = data.pages[index.id];

    if (questions.length === 0) {
        output.innerHTML = `<div class="error-message">出題できる問題がありません。</div>`;
        output.style.visibility = "visible";
        output.style.opacity = 1;
        return;
    }

    const questionText = questions[number - 1];
    const pageNumber = pages[number - 1];

    // 出題内容のHTMLを生成
    const message = `
    <div class="unit-title">数学${index.sub} ${index.name}</div>
    <div class="question-main">練習${questionText} (P.${pageNumber})</div>
    `;

    if (modeCompetitive) {
        output.style.backgroundColor = "#ffb0b0";
        output.style.borderColor = "#ff6868";
    }

    // 出題内容を表示
    output.innerHTML = message;
    output.style.visibility = "visible";
    output.style.opacity = 1;
});

// ストップボタンの処理
btnStop.addEventListener("click", () => {
    if (!modeCompetitive || !isClicked) return;
    isClicked = false;
    btnShow.textContent = "スタート";
    btnShow.style.backgroundColor = "#ff4a4a";
    btnShow.style.borderColor = "#ff2b2b";
    btnStop.style.visibility = "hidden";
    const elapsedTime = Date.now() - clickedTime;
    output.innerHTML = `<div class="result">記録 : ${(elapsedTime / 1000).toFixed(2)} 秒</div>`;
    output.style.backgroundColor = "#a6dbff";
    output.style.borderColor = "#3caffc";
});