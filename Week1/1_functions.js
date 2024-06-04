// HTML　から　div要素（id="result"）を取得
const result = document.getElementById('result');

// result.innerHTML = 'Result Div'
//演習1-0
const practice0 = () => {
  const min = -3;
  const max = 3;
  const step = 1;
  for (let theta = min; theta <= max; theta += step) {
    result.innerHTML += theta + ',';
  }
}
// practice0();

//演習1-1
const norm = (theta) => {
  return Math.exp(-theta * theta / 2) / Math.sqrt(2 * Math.PI);
}
const normDist = (min, max, step) => {
  const dist = [];
  for (let theta = min; theta <= max; theta += step)
    dist.push(norm(theta) * step);
  return dist;
}
// console.log(normDist(-3, 3, 1));
// const practice1 = () => {
//   const dist = normDist(-3, 3, 1);
//   for (let i = 0; i < dist.length; i++) {
//     result.innerHTML += dist[i].toFixed(3) + ', ';
//   }
// }
//practice1();

const practice1 = () => {
  normDist(-3, 3, 1).forEach(value => {
    result.innerHTML += value.toFixed(4) + ', ';
  })
}
// practice1();

//演習1-2
const correctProbability = (theta, a, b) => {
  return 1 / (1 + Math.exp(-1.7 * a * (theta - b)));
}
const responseProbability = (x, theta, a, b) => {
  const p = correctProbability(theta, a, b);
  return Math.pow(p, x) * Math.pow(1 - p, 1 - x);

}
const icc = (x, a, b, min, max, step) => {
  const iccDist = [];
  for (let theta = min; theta <= max; theta += step) {
    iccDist.push(responseProbability(x, theta, a, b));
  }
  return iccDist;
}
const practice2 = () => {
  result.innerHTML = responseProbability(0, 1, 1, 2).toFixed(3) + '<br>';
  icc(1, 1, 0, -3, 3, 1).forEach(value => {
    result.innerHTML += value.toFixed(3) + ', ';
  })
}
// practice2();

//演習1-3
const itemBank = [
  { a: 1, b: 0 },
  { a: 0.5, b: 0.3 }
];

const bayes = (x, itemBank, min, max, step) => {
  const dist = normDist(min, max, step); //P(θ)
  x.forEach((eachX, index) => {
    const item = itemBank[index]; // $itemBankから一つの問題セットを取得
    const likelihoodDist = icc(eachX, item.a, item.b, min, max, step);
    dist.forEach((_, theta, arr) =>
      arr[theta] *= likelihoodDist[theta]); //P(θ)ΠP(X|θ)
  });
  //周辺尤度の計算
  const marginalLikelihood = dist.reduce((a, b) => a + b); //P(θ)
  dist.forEach((_, theta, arr) =>
    arr[theta] /= marginalLikelihood);//P(θ)ΠP(X|θ)
  return dist;
}

const argmax = arr => arr.indexOf(arr.reduce((a, b) => Math.max(a, b)));

const estimation = (x, itemBank, min, max, step) => {
  const probability = bayes(x, itemBank, min, max, step);
  return min + argmax(probability) * step;
}

const practice3A = () => {
  bayes([1], [{ a: 1, b: 0 }], -2, 2, 1).forEach(value => {
    result.innerHTML += value.toFixed(3) + ', ';
  })
}
const practice3B = () => {
  result.innerHTML = estimation([1], [{ a: 1, b: 0 }], -2, 2, 1);
}
// practice3A();
// practice3B();

//演習1-4
const information = (theta, itemBank) => {
  let info = 0;
  itemBank.forEach(item => {
    const p = correctProbability(theta, item.a, item.b);
    info += 1.7 * 1.7 * item.a * item.a * p * (1 - p);
  });
  return info;
}

const standardError = (theta, itemBank) => {
  return 1.0 / Math.sqrt(information(theta, itemBank));
}

const practice4 = () => {
  result.innerHTML = information(0, [{ a: 1, b: 0 }]).toFixed(4);
}
// practice4();

const cauchy = (x0, eta) => {
  return x0 + eta * Math.tan(Math.PI * (Math.random() - 0.5));
}
/**
 * シミュレーション実験
 * @param {number} Q_NUM 問題数
 * @param {number} E_NUM 受験者数
 * @return {number} 平均誤差
 */
const simulation = (Q_NUM, E_NUM, eta) => {
  //アイテムバンク生成
  const itemBank = [];
  for (let i = 0; i < Q_NUM; i++) {
    itemBank.push({
      a: Math.random() * 2, //[0,2)
      b: (Math.random() - 0.5) * 6 //[-3,3)
    });
  }

  //受験者生成
  const examinee = [];
  for (let e = 0; e < E_NUM; e++) {
    examinee.push((Math.random() - 0.5) * 6); //[-3,3)
  }

  //受験者生成(コーシー分布)
  const examinee2 = [];
  for (let e = 0; e < E_NUM; e++) {
    examinee2.push(cauchy(0, eta));
  }
  //受験者ごとの誤差
  const error = [];
  for (const theta of examinee2) {
    const x = []; //正誤
    for (const item of itemBank) {
      x.push(correctProbability(theta, item.a, item.b) > Math.random() ? 1 : 0);
    }
    error.push(Math.abs(theta - estimation(x, itemBank, -3, 3, 0.1)));
  }

  //平均誤差
  return error.reduce((a, b) => a + b) / E_NUM;
}

result.innerHTML = '平均誤差: ' + simulation(50, 30, 1);