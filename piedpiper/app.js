const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session); // подключаем всю нашу ересь
const passport = require('passport');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html')); // подключаем нашу форму

app.use(express.json()); //Переводим все полученные данные в объекты json
app.use(express.urlencoded({extended: false})); //Запрещаем формировать массивы(Если передаете массив данных,лучше поставить true)
//Инициализируем сессию
app.use(
	session({
		secret: "secret", //Задаем ключ сессий
		store: new FileStore(), //Указываем место хранения сессий(Используя этот пакет,у вас будет создана папка sessions, в которой будут хранится сессии и, даже если сервер перезагрузится,пользователь останется авторизованным
		cookie: {
			path: "/",
			httpOnly: true, // path - куда сохранять куки, httpOnly: true - передача данных только по https/http,maxAge - время жизни куки в миллисекундах 60 * 60 * 1000 = 1 час 
			maxAge: 60 * 60 * 1000
		},
		resave: false,
    saveUninitialized: true
	})
);

const mysql = require('mysql');

var connection = mysql.createConnection({
	   host: "localhost",
	   user: "root",
	   password: "1111",
	   database: "test"
	});
	connection.connect(function(err){
	   if (err) {
		 return console.error("Ошибка: " + err.message);
	   }
	   else{
		 console.log("Подключение к серверу MySQL успешно установлено");
	   }
	});
require('./config'); //Подключаем наш конфиг
app.use(passport.initialize()); //Инициализируем паспорт
app.use(passport.session()); //Синхронизируем сессию с паспортом
//Проверяем если авторизован - пропускаем дальше,если нет запрещаем посещение роута
const logout = (req,res,next) => {
	if(req.isAuthenticated()) {
		return res.redirect('/admin');
	} else {
		next()
	}
}
//Подключаем нашу форму
app.get('/',(req, res) => res.sendFile(__dirname + '/index.html'));
//При POST запросе проверяем передан ли пользователь, если да - пропускаем,если нет - возвращаем к форме
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) {
    	return next(err);
    }
    if (!user) { 
    	return res.redirect('/');
    	console.log(user);
    }
    req.logIn(user, function(err) {
      if (err) { 
      	return next(err);
      }
      return res.redirect('/admin');
    });
  })(req, res, next);
});
app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
  });