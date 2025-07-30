async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
  const app = document.getElementById('app');
  const books = await loadJSON('data/books.json');
  showBookList(app, books);
}

function showBookList(app, books) {
  app.innerHTML = '<h2>書籍一覧</h2>';
  const tpl = document.getElementById('book-list-template');
  books.forEach(b => {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.id = b.id;
    el.querySelector('.cover').src = b.cover;
    el.querySelector('.title').textContent = b.title;
    el.addEventListener('click', () => openBook(b));
    app.appendChild(el);
  });
}

async function openBook(book) {
  const data = await loadJSON(`data/${book.id}.json`);
  const app = document.getElementById('app');
  app.innerHTML = `<h2>${data.title}</h2>`;
  const menu = document.createElement('div');
  menu.innerHTML = '<button id="listBtn">一覧</button> ' +
                   '<button id="cardBtn">カード</button> ' +
                   '<button id="quizEnJa">英->日クイズ</button> ' +
                   '<button id="quizJaEn">日->英クイズ</button>';
  app.appendChild(menu);
  document.getElementById('listBtn').onclick = () => showList(data);
  document.getElementById('cardBtn').onclick = () => showCards(data);
  document.getElementById('quizEnJa').onclick = () => startQuiz(data, 'enja');
  document.getElementById('quizJaEn').onclick = () => startQuiz(data, 'jaen');
}

function showList(data) {
  const app = document.getElementById('app');
  app.innerHTML = `<h2>${data.title} - 一覧</h2>`;
  const tpl = document.getElementById('word-item-template');
  data.sections.forEach(sec => {
    const secTitle = document.createElement('h3');
    secTitle.textContent = sec.name;
    app.appendChild(secTitle);
    sec.words.forEach(w => {
      const el = tpl.content.firstElementChild.cloneNode(true);
      el.querySelector('.q').textContent = w.word[0];
      el.querySelector('.a').textContent = w.meanings[0];
      app.appendChild(el);
    });
  });
}

function showCards(data) {
  const app = document.getElementById('app');
  let index = 0;
  const words = data.sections.flatMap(s => s.words);
  app.innerHTML = `<h2>${data.title} - カード</h2>`;
  const card = document.createElement('div');
  card.className = 'word-card';
  card.innerHTML = `<div class='front'></div><div class='back' style='display:none'></div>`;
  app.appendChild(card);
  const btnNext = document.createElement('button');
  btnNext.textContent = '次へ';
  app.appendChild(btnNext);

  function render() {
    const w = words[index];
    card.querySelector('.front').textContent = w.word[0];
    card.querySelector('.back').textContent = w.meanings[0];
    card.querySelector('.back').style.display = 'none';
  }
  card.addEventListener('click', () => {
    const back = card.querySelector('.back');
    back.style.display = back.style.display === 'none' ? 'block' : 'none';
  });
  btnNext.addEventListener('click', () => {
    index = (index + 1) % words.length;
    render();
  });
  render();
}

function startQuiz(data, mode) {
  const app = document.getElementById('app');
  const words = data.sections.flatMap(s => s.words);
  let index = 0;
  let score = 0;
  app.innerHTML = `<h2>${data.title} - クイズ</h2><div id='timer'></div><div id='question'></div><div id='options'></div>`;
  const timerEl = document.getElementById('timer');
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  let timer;

  function render() {
    if (index >= words.length) {
      app.innerHTML = `<h2>終了 得点:${score}/${words.length}</h2>`;
      return;
    }
    const w = words[index];
    const q = mode === 'enja' ? w.word[0] : w.meanings[0];
    const opts = mode === 'enja' ? w.meanings : w.word;
    let t = 10;
    timerEl.textContent = `残り:${t}s`;
    clearInterval(timer);
    timer = setInterval(() => {
      t--; timerEl.textContent = `残り:${t}s`;
      if (t<=0) { clearInterval(timer); index++; render(); }
    }, 1000);
    questionEl.textContent = q;
    optionsEl.innerHTML = '';
    opts.forEach((opt, i) => {
      const b = document.createElement('div');
      b.className = 'quiz-option';
      b.textContent = opt;
      b.onclick = () => {
        clearInterval(timer);
        if (i===0) { b.classList.add('correct'); score++; } else { b.classList.add('wrong'); }
        setTimeout(() => { index++; render(); }, 500);
      };
      optionsEl.appendChild(b);
    });
  }
  render();
}

window.addEventListener('load', init);
