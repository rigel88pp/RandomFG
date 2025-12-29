import { units } from './units.js';

// 設定フォームとリセットボタンの要素を取得
const form = document.getElementById("settingsForm");
const btnAllSelect = document.getElementById("btnAllSelect");
const btnModeToggle = document.getElementById("btnModeToggle");

// 全単元ID一覧
const allUnitIds = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
];

// 競技用デフォルト単元ID一覧
const competitiveUnitIds = [
    "2", "4", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "19", "20",
];

// 全選択ボタンがクリックされたときの処理
btnAllSelect.addEventListener("click", () => {
    if (modeCompetitive) {
        // 競技モード中は変更を無視
        return;
    }
    onClickAllSelect();
});

function onClickAllSelect() {
    // 今の選択状態を取得
    const currentUnits = JSON.parse(localStorage.getItem("enableUnits") || "[]");
    // 全部選択されているかどうかを判定
    const allSelected = currentUnits.length === allUnitIds.length;
    // 全部選択されていれば空配列、そうでなければ全部選択
    const newUnitIds = allSelected ? [] : allUnitIds;
    localStorage.setItem("enableUnits", JSON.stringify(newUnitIds));
    // チェック状態を反映
    loadSelections();
}

let modeCompetitive = JSON.parse(localStorage.getItem("modeCompetitive") || "false");
let reservedUnitIds = JSON.parse(localStorage.getItem("reservedUnitIds") || JSON.stringify(allUnitIds));

// モード切替ボタンがクリックされたときの処理
btnModeToggle.addEventListener("click", () => {
    modeCompetitive = !modeCompetitive;
    updateModeButton();
    onClickModeToggle();
});

function updateModeButton() {
    const checkboxes = form.querySelectorAll('input[name="unit"]');

    if (modeCompetitive) {
        btnModeToggle.classList.add("on");
        btnModeToggle.textContent = "競技モード: ON";

        // フォームを編集不可に
        checkboxes.forEach(cb => {
            cb.disabled = true;
        });

        // フォームの見た目を競技モード用に
        form.classList.add("competitive");
        form.classList.remove("normal");

        btnAllSelect.style.backgroundColor = "#adadad";
        btnAllSelect.style.borderColor = "#adadad";

    } else {
        btnModeToggle.classList.remove("on");
        btnModeToggle.textContent = "競技モード: OFF";

        // フォームを編集可能に
        checkboxes.forEach(cb => {
            cb.disabled = false;
        });

        // フォームの見た目を通常用に
        form.classList.add("normal");
        form.classList.remove("competitive");

        btnAllSelect.style.backgroundColor = "#3498db";
        btnAllSelect.style.borderColor = "#2980b9";
    }
}

function onClickModeToggle() {
    if (modeCompetitive) {
        // 現在の選択状態を保存
        const currentUnits = JSON.parse(localStorage.getItem("enableUnits") || "[]");
        reservedUnitIds = currentUnits;
        localStorage.setItem("reservedUnitIds", JSON.stringify(reservedUnitIds));
    }
    const newUnitIds = modeCompetitive ? competitiveUnitIds : reservedUnitIds;
    localStorage.setItem("enableUnits", JSON.stringify(newUnitIds));
    localStorage.setItem("modeCompetitive", JSON.stringify(modeCompetitive));
    // チェック状態を反映
    loadSelections();
}
// 初期表示のモードボタン状態を設定
updateModeButton();

// ローカルストレージの選択状態を読み込み、フォームのチェック状態に反映
function loadSelections() {
    const savedRaw = localStorage.getItem("enableUnits");

    let saved;
    if (savedRaw === null) {
        // 保存されていない場合は初期状態を使用
        saved = allUnitIds;
        localStorage.setItem("enableUnits", JSON.stringify(saved));
    } else {
        // 保存されている場合はそれを使用
        saved = JSON.parse(savedRaw);
    }

    // チェックボックスをすべて取得して、保存された値に応じてチェック状態を更新
    const checkboxes = form.querySelectorAll('input[name="unit"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = saved.includes(checkbox.value);
    });
}

// 単元データを元に、フォームにチェックボックスとラベルを動的に追加
for (const unit of units) {
    const checkbox = document.createElement("input");
    const label = document.createElement("label");

    const unitId = String(unit.id);
    const inputId = `unit${unitId}`;

    // チェックボックスの設定
    checkbox.type = "checkbox";
    checkbox.name = "unit";
    checkbox.value = unitId;
    checkbox.id = inputId;
    // checkbox.checked = saved.includes(unitId);

    // ラベルの設定
    label.setAttribute("for", inputId);
    label.className = "unit-label";
    label.textContent = `${unit.name} (${unit.sub})`;

    // フォームに追加
    form.appendChild(checkbox);
    form.appendChild(label);
}

// チェック状態が変更されたとき、ローカルストレージに保存
form.addEventListener("change", () => {
    if (modeCompetitive) {
        // 競技モード中は変更を無視
        // loadSelections();
        return;
    }
    const checked = [...form.querySelectorAll('input[name="unit"]:checked')]
        .map(input => input.value);
    localStorage.setItem("enableUnits", JSON.stringify(checked));
});

// ページ読み込み時に選択状態を反映
window.addEventListener("DOMContentLoaded", () => {
    if (modeCompetitive) {
        localStorage.setItem("enableUnits", JSON.stringify(competitiveUnitIds));
    }
    loadSelections();
    updateModeButton();
});