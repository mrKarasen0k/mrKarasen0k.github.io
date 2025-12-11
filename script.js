// Легкие вопросы с объяснениями
const questions = [
    {
        question: "Солнце вращается вокруг Земли?",
        answer: false,
        explanation: "Нет, это неправильно. Земля вращается вокруг Солнца, а не наоборот. Это открытие было сделано еще в древности."
    },
    {
        question: "Вода закипает при температуре 100 градусов Цельсия?",
        answer: true,
        explanation: "Да, это правда! При нормальном атмосферном давлении вода закипает именно при 100°C."
    },
    {
        question: "У человека есть сердце?",
        answer: true,
        explanation: "Конечно! Сердце - это важный орган, который перекачивает кровь по всему организму."
    },
    {
        question: "Помидор - это овощ?",
        answer: false,
        explanation: "На самом деле помидор - это фрукт! С ботанической точки зрения, помидор является ягодой."
    },
    {
        question: "В неделе 7 дней?",
        answer: true,
        explanation: "Да, верно! Неделя состоит из 7 дней: понедельник, вторник, среда, четверг, пятница, суббота и воскресенье."
    },
    {
        question: "Снег всегда белый?",
        answer: true,
        explanation: "Да, снег выглядит белым, потому что он отражает весь видимый свет. Хотя снежинки сами по себе прозрачные!"
    },
    {
        question: "Рыбы дышат под водой?",
        answer: true,
        explanation: "Да! Рыбы дышат через жабры, которые извлекают кислород из воды."
    },
    {
        question: "Банан - это дерево?",
        answer: false,
        explanation: "Нет, банан - это не дерево, а трава! Банановое растение - это самая большая трава в мире."
    },
    {
        question: "В году 365 дней?",
        answer: true,
        explanation: "Почти всегда! Обычный год имеет 365 дней, а високосный год - 366 дней (добавляется 29 февраля)."
    },
    {
        question: "Молоко производится только коровами?",
        answer: false,
        explanation: "Нет, молоко могут производить многие млекопитающие: козы, овцы, верблюды и даже люди!"
    }
];

let currentQuestion = 0;
let score = 0;

const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const explanationText = document.getElementById('explanation-text');
const currentQEl = document.getElementById('current-q');
const totalQEl = document.getElementById('total-q');
const trueBtn = document.getElementById('true-btn');
const falseBtn = document.getElementById('false-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreEl = document.getElementById('score');

// Инициализация
totalQEl.textContent = questions.length;

startBtn.addEventListener('click', () => {
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    quizScreen.classList.add('active');
    loadQuestion();
});

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }

    const q = questions[currentQuestion];
    questionText.textContent = q.question;
    explanationText.textContent = '';
    explanationText.style.display = 'none';
    currentQEl.textContent = currentQuestion + 1;
    
    trueBtn.disabled = false;
    falseBtn.disabled = false;
    trueBtn.style.opacity = '1';
    falseBtn.style.opacity = '1';
    nextBtn.style.display = 'none';
}

trueBtn.addEventListener('click', () => checkAnswer(true));
falseBtn.addEventListener('click', () => checkAnswer(false));

function checkAnswer(userAnswer) {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer === q.answer;
    
    if (isCorrect) {
        score++;
    }
    
    // Показываем объяснение
    explanationText.textContent = q.explanation;
    explanationText.style.display = 'block';
    explanationText.className = isCorrect ? 'explanation correct' : 'explanation incorrect';
    
    // Отключаем кнопки
    trueBtn.disabled = true;
    falseBtn.disabled = true;
    trueBtn.style.opacity = '0.5';
    falseBtn.style.opacity = '0.5';
    
    // Показываем кнопку "Далее"
    nextBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
    currentQuestion++;
    loadQuestion();
});

restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    resultScreen.classList.remove('active');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    quizScreen.classList.add('active');
    loadQuestion();
});

function showResults() {
    quizScreen.classList.remove('active');
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    resultScreen.classList.add('active');
    scoreEl.textContent = `${score} из ${questions.length}`;
}