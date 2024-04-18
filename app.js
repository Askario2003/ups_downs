const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path'); // Добавленный импорт модуля path
const session = require('express-session');

const app = express();

// Подключение к базе данных MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stories_db'
});

connection.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключено к базе данных MySQL');
});

app.use(session({
    secret: 'secret-key', // Здесь указывается секретный ключ для подписи сессии
    resave: false,
    saveUninitialized: true
}));

// Использование body-parser для обработки данных формы
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');

// Middleware для обслуживания статических файлов из папки public
app.use(express.static(path.join(__dirname, '')));

// Роут для переключения темы
app.get('/toggle-dark-mode', (req, res) => {
    req.session.darkMode = !req.session.darkMode; // Переключение темы
    res.redirect('/'); // Перенаправление на главную страницу
});

// Роут для отображения главной страницы
app.get('/', (req, res) => {
    connection.query('SELECT * FROM stories ORDER BY created_at DESC', (error, results) => {
        if (error) throw error;
        const darkMode = req.session.darkMode || false; // Получаем сохраненную тему из сессии
        res.render('index', { stories: results, darkMode: darkMode });
    });
});



// Роут для отображения страницы добавления новой истории
app.get('/add', (req, res) => {
    const darkMode = req.session.darkMode || false; // Получаем сохраненную тему из сессии
    res.render('add', { darkMode: darkMode });
});





// Маршрут для обработки отправки новой истории
app.post('/add', (req, res) => {
    const { title, content, author } = req.body;
    const newStory = { title, content, author };
    connection.query('INSERT INTO stories SET ?', newStory, (error, results) => {
        if (error) {
            throw error;
        }
        console.log('Новая история успешно добавлена');
        res.redirect('/');
    });
});
// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
