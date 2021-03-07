const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session); // подключаем всю нашу ересь
const passport = require('passport');
const app = express();
flash = require('connect-flash');
const port = 8080;


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

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
		resave: true,
    saveUninitialized: true
	})
);

const mysql = require('mysql');

var connection = mysql.createConnection({
	   host: "82.202.165.88",
	   user: "nastya",
	   password: "l2-3Rdasda-AWe2eldps-aWLepp2",
	   database: "practice"
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
    	return res.redirect('http://localhost/project/index.html');
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
//При POST запросе проверяем есть ли пользователь в базе, если да - возвращаем к форме и пишем в консоль что такой пользователь есть,если нет - регистрируем и перекидываем на авторизацию 
app.post('/register', function(req,res) {
	let email = req.body.email;
	let password = req.body.password;
	connection.query("SELECT * FROM users WHERE email = '" + email + "'",	function(err,res){

		if (res.length < 1) {
	
			connection.query("INSERT INTO users (email,password) VALUES('" + email + "','" + password + "')", function(err,res) {
		  	
			  	if(err) console.log(err);
			  	
			  	else {
			  		console.log(email)
			  	}

			});

		}

		else {

			console.log('email registered!');

		}

	});
	return res.redirect('http://localhost/project/index.html')
});

//При роуте /register подключаем форму регистрации
app.get('/register',logout, (req,res) => res.sendFile(__dirname + '/register.html'))
//Проверяем если пользователь авторизован - пропускаем,если нет - возвращаем к форме
const auth = (req,res,next) => {
	if(req.isAuthenticated()) {
		next()
		
	} else {
		return res.redirect('http://localhost/project/index.html');
	}

}
app.get('/admin', auth, (req, res) => {
	res.send('Добро пожаловать');
});
app.get('/logout', (req,res) => {
	req.logout();
	res.redirect('http://localhost/project/index.html');
});