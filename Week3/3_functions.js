const getItem = async (i) => {
  const response = await fetch('./2_itemBank.json?v=' + Date.now());
  const data = await response.json();
  return data[i];
}
//practice2-1
// const practice1 = () => {
// getItem(5).then(item => console.log(item.choices[0]));
// }
// practice1();
const exam = {};
let questionNum = 1; //問題番号
const myChoice = [];//選択した解答
const ox = [];//正誤○,×
const questionTimes = []; //解答にかかった時間の配列

const createExam = (item) => { /* 問題文・選択肢の生成 */
  startTime = Math.floor(new Date().getTime() / 1000);//時間測定の始まり
  //問題文領域
  const questionArea = document.getElementById('question-area');
  questionArea.innerHTML = questionNum + '.' + item.question;

  //選択肢領域
  const choices = item.choices;
  const choiceArea = document.getElementById('choice-area');
  choiceArea.classList.add("m-3")
  choiceArea.innerHTML = '';
  choices.forEach((eachChoice, index) => {
    //ラジオボタン
    const input = document.createElement('input');
    input.id = 'choice' + index;
    input.type = 'radio';
    input.name = 'choices';
    input.value = index;
    input.style.cursor = 'pointer';
    input.classList.add("form-check-label");
    input.required = true;//ラジオボタンが押されないと解答ボタンが押されない機能

    //選択肢ラベル
    const label = document.createElement('label');
    label.setAttribute('for', 'choice' + index);
    label.innerHTML = '&nbsp&nbsp' + eachChoice;
    label.style.cursor = 'pointer';
    label.classList.add("form-check-label");
    //選択肢領域への追加
    const div = document.createElement('div');
    div.appendChild(input);
    div.appendChild(label);
    div.classList.add("form-check");
    choiceArea.appendChild(div);
  });
  questionNum++;
  const submitButton = document.getElementById('submit-button');
  submitButton.addEventListener('click', () => {//解答ボタンが押されたとき実行される関数
    const endTime = Math.floor(new Date().getTime() / 1000);//解答が終わる時間
    elapsedTime = endTime - startTime; //解答所要時間の計算
  }
  );
  questionTimes.push(elapsedTime);
}
const startTesting = async () => { /* テスト開始時の処理 */
  exam.n = 0; //解答数
  exam.x = []; //正誤
  exam.theta = 0; //能力値
  exam.bank = []; //項目履歴　/*追加*/
  errorRate = 0; //誤謬率
  createExam(await getItem(0));
}
startTesting();

// フォームが送信されたとき(解答ボタンが押されたとき)の処理
document.getElementById('exam-box').onsubmit = (e) => {
  e.preventDefault(); //フォームの送信(ページ更新)の停止
  continueTesting(); //テスト継続処理の呼び出し
}

const continueTesting = async () => { /*テスト継続時の処理*/
  //選択されているラジオボタンの値を取得
  const choice = parseInt(document.getElementById('exam-box').choices.value);
  //現在の問題項目を取得
  let item = await getItem(exam.n);
  //選択した解答の記録
  myChoice.push(item.choices[choice]);
  if (typeof item.correct != 'undefined') {
    //問題項目の保存
    exam.bank.push(item);
    //正答なら 1、誤答なら 0 を記録
    exam.x.push(choice == item.correct ? 1 : 0);
    //配列oxに正答なら ○、誤答なら × を記録
    ox.push(choice == item.correct ? '○' : '×');
    //能力値(正答率)を計算
    exam.theta = estimation(exam.x, exam.bank, -3, 3, 0.1);
  }
  //解答数を繰り上げ
  exam.n++;
  //次の問題項目を取得
  item = await getItem(exam.n);
  //次の問題があれば出力、なければテスト終了
  if (typeof item !== 'undefined')
    createExam(item);
  else {
    finishTesting();
    const confidenceLevel = document.getElementById('confidence-level');
    const englishConf = myChoice[0];//英語自信度
    const japaneseConf = myChoice[1];//国語自信度
    const testConf = myChoice[exam.n - 1];//テスト全体
    confidenceLevel.style.display = 'block';
    confidenceLevel.innerHTML = '<h3>自信度</h3>' + '英語：　' + englishConf + '<br>' + '国語：　' + japaneseConf + '<br>' + 'テスト：' + testConf;
    for (let i = 1; i <= 5; i++) {
      const seigo = document.getElementById(i + '_2');//正誤
      seigo.innerText = ox[i - 1];
      const t = document.getElementById(i + '_3');//時間
      t.innerText = questionTimes[i + 1] + 's';
    }
  }
};

const finishTesting = async () => { /*テスト終了時の処理 */
  errorRate = (1 - exam.x.reduce((a, b) => a + b) / (exam.n - 3)).toFixed(1);
  let result = '<h1>試験は終了です。</h1>'
    + '<p>あなたの能力値は' + exam.theta + 'です。</p>';
  result += '<p>正答率は' + exam.x.reduce((a, b) => a + b) / (exam.n - 3) + 'です</p>' + '<p>あなたの誤謬率は' + errorRate + 'です。</p>';
  document.getElementById('exam-box').innerHTML = result;
  const resultTable = document.getElementById('result-table');
  resultTable.style.display = 'table';
  for (let i = 1; i <= 5; i++) {
    const choice = document.getElementById(i + '_1');
    choice.innerText = myChoice[i + 1];
  }
}
