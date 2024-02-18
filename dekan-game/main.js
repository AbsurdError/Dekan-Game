const startButton = document.querySelector('.start');
let userName = localStorage.getItem('userName'); // Получаем имя пользователя из localStorage


document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.querySelector('.start');
    startButton.addEventListener('click', function() {
        let userName = document.getElementById('user_name').value; // Получаем значение переменной
        if (userName) {
            localStorage.setItem('userName', userName); // Сохраняем имя пользователя в localStorage
            window.location.href = './games.html'; // Переходим на страницу игры
        } else {
            alert('Пожалуйста, введите ник перед началом игры.');
        }
    });
});


let maps = document.querySelectorAll('.map');
let mapValue = localStorage.getItem('mapValue'); // Получаем mapValue из localStorage

maps.forEach((map, index) => {
  map.addEventListener('click', () => {
    mapValue = map.getAttribute('alt');
    localStorage.setItem('mapValue', mapValue); // Сохраняем mapValue в localStorage
    console.log(mapValue);
  });
});
////////////////////////////////////////



let canvas = document.getElementById('game');
let context = canvas.getContext('2d')
let aster =[]; // астероид
let timer = 0; //таймер
let ship = {x: 300, y: 300}; // игрок
let fire = []; // выстрел игрока
let trap = []; // ловушка (чёрная дыра)
let lives = 5; // жизни игрока
let startTime = new Date().getTime();
let isPaused = false; // Переменная для отслеживания состояния паузы
let boss = {x: Math.random() * 600, y: 0, hp: 15}; // босс с 15 хп
// для отслеживания статистики
let collisionsWithAster = 0;
let collisionsWithTrap = 0;
let endTime;

let fongame = mapValue;
if (fongame == 1){
let fonimg = new Image();
fonimg.src = 'fon.png';
fongame = fonimg
} else if (fongame == 2){
let fon2img = new Image();
fon2img.src = 'fon2.png';
fongame = fon2img
} else if (fongame == 3){
let fon3img = new Image();
fon3img.src = 'fon3.png';
fongame = fon3img
}

// фон игры
let fonimg = new Image();
fonimg.src = 'fon.png';

// игрок

let shipimg = new Image();
shipimg.src = 'ship.png'

// выстрел игрока

let fireimg = new Image();
fireimg.src = 'fire.png'

// объёкт взаимодействия (астароид)
let asterimg = new Image();
asterimg.src = 'astero.png';

// ловушка (чёрная дыра)
let trapimg = new Image();
trapimg.src = 'trap.png'

// босс

let bossimg = new Image();
bossimg.src = 'boss.png';

fongame.onload = function () {
    game();
}

function update() {

if (isPaused) {
return; // Если игра на паузе, прекращаем обновление
}
// Предотвращение выхода за границы поля для объекта ship
if (ship.x < 0) {
ship.x = 0; // Если x координата меньше 0, устанавливаем её равной 0
} else if (ship.x > canvas.width - 50) {
ship.x = canvas.width - 50; // Если x координата больше ширины поля минус ширина корабля, устанавливаем её равной этой разнице
}

if (ship.y < 0) {
ship.y = 0; // Если y координата меньше 0, устанавливаем её равной 0
} else if (ship.y > canvas.height - 50) {
ship.y = canvas.height - 50; // Если y координата больше высоты поля минус высота корабля, устанавливаем её равной этой разнице
}

timer++; // таймер + 1
// спавн выстрелов
if (timer%40==0){
fire.push({x: ship.x + 10, y: ship.y, dx: 0, dy: -5.2}); // Создаем выстрел и добавляем его в массив fire
fire.push({x: ship.x + 10, y: ship.y, dx: -0.5, dy: -5});
fire.push({x: ship.x + 10, y: ship.y, dx: 0.5, dy: -5});
}
for (let i = 0; i < fire.length; i++) {
fire[i].x = fire[i].x + fire[i].dx;
fire[i].y = fire[i].y + fire[i].dy;
if (fire[i].y < -30) {
fire.splice(i, 1);
i--; // уменьшаем значение i, так как мы удалили элемент из массива
}
}

// запуск астероида каждые 15 тиков
// спавн астероидов

if (timer%22 == 0){
aster.push({
x:Math.random()*600,
y:-50,
dx:Math.random()*2-1,
dy:Math.random()*2+2,
del: 0});
}

for (let i = 0; i < aster.length; i++) {
aster[i].x = aster[i].x + aster[i].dx;
aster[i].y = aster[i].y + aster[i].dy;

if (aster[i].x >= 550 || aster[i].x < 0) {
    aster[i].dx = -aster[i].dx;
}
if (aster[i].y >= 600) {
    aster.splice(i, 1);
    i--; // уменьшаем значение i, так как мы удалили элемент из массива
} else {
    let asteroidHit = false;
    for (let j = 0; j < fire.length; j++) {
        if (Math.abs(aster[i].x + 25 - fire[j].x - 15) < 50 && Math.abs(aster[i].y - fire[j].y) < 25) {
            aster[i].del = 1;
            fire.splice(j, 1);
            asteroidHit = true;
            break;
        }
    }
    if (asteroidHit || aster[i].del === 1) {
        aster.splice(i, 1);
        i--; // уменьшаем значение i, так как мы удалили элемент из массива
    }
}
}

// столкновение игрока с астероидом
for (let i = 0; i < aster.length; i++) {
if (
ship.x < aster[i].x + 50 &&
ship.x + 50 > aster[i].x &&
ship.y < aster[i].y + 50 &&
ship.y + 50 > aster[i].y
) {
lives--;
aster.splice(i, 1);
collisionsWithAster++; // Увеличиваем счетчик столкновений с астероидами
if (lives === 0) {
endGame(); // Вызываем функцию окончания игры
}
}
}

// Спавн ловушки каждые 3 секунды
if (timer % 180 === 0) {
    trap.push({x: Math.random() * 600, y: Math.random() * 600});
    trap.push({x: Math.random() * 600, y: Math.random() * 600});
}
// Удаление ловушки через 3 секунды
for (let i = 0; i < trap.length; i++) {
trap[i].timeToLive = trap[i].timeToLive ? trap[i].timeToLive - 1 : 360; // Уменьшаем время жизни ловушки
if (trap[i].timeToLive <= 0) {
trap.splice(i, 1); // Удаляем ловушку, если время жизни истекло
i--; // Уменьшаем значение i, так как мы удалили элемент из массива
}
}

// Уничтожение объекта trap при столкновении с ним
for (let i = 0; i < trap.length; i++) {
if (
ship.x < trap[i].x + 50 &&
ship.x + 50 > trap[i].x &&
ship.y < trap[i].y + 50 &&
ship.y + 50 > trap[i].y
) {
lives--;
trap.splice(i, 1);
collisionsWithTrap++; // Увеличиваем счетчик столкновений с ловушками
if (lives === 0) {
endGame(); // Вызываем функцию окончания игры
}
}
}

const bossSpeed = 0.35; // Устанавливаем скорость босса

// Рассчитываем направление движения босса к игроку
const dx = ship.x - boss.x;
const dy = ship.y - boss.y;
const distance = Math.sqrt(dx * dx + dy * dy); // Рассчитываем расстояние между боссом и игроком

// Нормализуем направление, чтобы получить вектор единичной длины
const directionX = dx / distance;
const directionY = dy / distance;

// Обновляем позицию босса с учетом направления и скорости
boss.x += directionX * bossSpeed;
boss.y += directionY * bossSpeed;

if (boss.x < 0) {
boss.x = 0;
} else if (boss.x > canvas.width - 300) {
boss.x = canvas.width - 300;
}

if (boss.y < 0) {
boss.y = 0;
} else if (boss.y > canvas.height - 100) {
boss.y = canvas.height - 100;
}

// Проверка столкновения выстрела с боссом
for (let i = 0; i < fire.length; i++) {
if (
boss.x < fire[i].x + 30 &&
boss.x + 200 > fire[i].x &&
boss.y < fire[i].y + 30 &&
boss.y + 100 > fire[i].y
) {
boss.hp--; // Уменьшаем количество жизней у босса при попадании выстрела
fire.splice(i, 1); // Удаляем выстрел при попадании
if (boss.hp === 0) {
// Если у босса не осталось жизней, удаляем его из игры
boss = {x: Math.random() * 600, y: 0, hp: 22};
}
}
}
}

function render() {
if (!isPaused) {
    // Отрисовка игрового процесса
    context.drawImage(fongame, 0, 0, 600, 600); // отрисовка фона
    context.drawImage(shipimg, ship.x, ship.y, 50, 50); // отрисовка игрока
    fire.forEach(f => context.drawImage(fireimg, f.x, f.y, 30, 30)); // отрисовка выстрелов
    trap.forEach(t => context.drawImage(trapimg, t.x, t.y, 50, 50)); // отрисовка ловушки
    aster.forEach(a => context.drawImage(asterimg, a.x, a.y, 50, 50)); // отрисовка астероидов
    // Отрисовка босса и его здоровья
    context.drawImage(bossimg, boss.x, boss.y, 200, 100);
    context.fillStyle = "red";
    context.fillRect(boss.x, boss.y + 10, boss.hp * 10, 2);
    // Отрисовка информации о жизнях и времени
    context.font = "20px Arial";
    context.fillStyle = "white";
    context.fillText("Player: " + userName, 10, 30);
    context.fillText("Количество хп: " + lives, 10, 50);
    let LiveTime = new Date();
    let LiveTimeString = LiveTime.toLocaleTimeString();
    context.fillText("Текущее время: " + LiveTimeString, 10, 70);
    let minutes = Math.floor((LiveTime.getTime() - startTime) / 60000); // Рассчитываем минуты
    let seconds = Math.floor((LiveTime.getTime() - startTime) / 1000) % 60; // Рассчитываем секунды
    context.fillText("Игровое время: " + minutes + " : " + seconds, 10, 90);
} else {
// Отрисовка статистики после окончания игры
renderEndGameStats();
}

let gameTime = new Date().getTime() - startTime; // Рассчитываем время игры
if (gameTime >= 3 * 60 * 1000) { // Если время игры больше или равно 3 минутам
isPaused = true; // Останавливаем игру
context.clearRect(0, 0, canvas.width, canvas.height);
context.font = "30px Arial";
context.fillStyle = "black";
context.fillText("Победа!", 250, 200); // Выводим надпись "Победа"
context.fillText("Player: " + userName, 100, 250);
context.fillText("Оставшиеся жизни: " + lives, 100, 280);
context.fillText("Столкновений с астероидами: " + collisionsWithAster, 100, 310);
context.fillText("Столкновений с ловушками: " + collisionsWithTrap, 100, 340);
}
}

// заготовка для универсальности браузера
let requestAnimFrame = (function(){
return window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function (callback){
window.setTimeout(callback, 1000 / 20);
};
})();

// Основной игровой цикл
function endGame() {
isPaused = true; // Останавливаем игру
endTime = new Date().getTime(); // Фиксируем время окончания игры
document.removeEventListener('keydown', pauseGame);
}

function renderEndGameStats() {
let gameTime = (endTime - startTime) / 1000;

// Очищаем холст
context.clearRect(0, 0, canvas.width, canvas.height);

// Отображаем статистику
context.font = "20px Arial";
context.fillStyle = "white";
context.fillText("Player: " + userName, 100, 100);
context.fillText("Игра окончена", 100, 70);
context.fillText("Время игры: " + gameTime.toFixed(2) + " секунд", 100, 130);
context.fillText("Оставшиеся жизни: " + lives, 100, 160);
context.fillText("Столкновений с астероидами: " + collisionsWithAster, 100, 190);
context.fillText("Столкновений с ловушками: " + collisionsWithTrap, 100, 220);
context.fillText("Нажмите на R что бы начать игру заново", 100, 250);
}

// В функции game() добавьте проверку на isPaused перед вызовом update() и render()
function game() {
if (!isPaused) {
update();
}
render(); // Вызываем render вне зависимости от состояния паузы
requestAnimFrame(game);
}

function restartGame() {
    aster = [];
    timer = 0;
    ship = {x: 300, y: 300};
    fire = [];
    trap = [];
    lives = 5;
    startTime = new Date().getTime();
    isPaused = false;
    boss = {x: Math.random() * 600, y: 0, hp: 15};
    collisionsWithAster = 0;
    collisionsWithTrap = 0;
    endTime = null;

    game();
    document.addEventListener('keydown', pauseGame);
}

// Обработчик нажатия клавиш передвижение игрока

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
      ship.x -= 10;
    } else if (event.key === 'ArrowRight') {
      ship.x += 10;
    } else if (event.key === 'ArrowUp') {
      ship.y -= 10;
    } else if (event.key === 'ArrowDown') {
      ship.y += 10;
    } else if (event.key === 'R' || event.key === 'r' || event.key === 'К' || event.key === 'к') {
      restartGame();
    }
  });

  function pauseGame(event) {
    if (event.key === 'Escape') {
      isPaused = !isPaused; 
      event.preventDefault(); 
    }
  }
  document.addEventListener('keydown', pauseGame);


