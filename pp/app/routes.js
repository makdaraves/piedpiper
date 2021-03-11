

module.exports = function(app, passport) {


	// Переадресация на главную

	app.get('/', function(req, res) {
		res.render('index.ejs'); 
	});


	// LOGIN 

	// показ формы
	
	app.get('/login', function(req, res) {

		// отобразить страницу и передать флэш-данные
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// обработать форму входа
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', 
            failureRedirect : '/login', // перенаправить обратно на страницу регистрации в случае ошибки
            failureFlash : true // разрешить флэш-сообщения
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });


	// SIGNUP 

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// обработать форму регистрации
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', 
		failureRedirect : '/signup', 
		failureFlash : true 
	}));


	// PROFILE SECTION 

	// что бы посетить надо быть авторизованым
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // вывести пользователя из сеанса
		});
	});


	// LOGOUT 

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// промежуточное ПО маршрута
function isLoggedIn(req, res, next) {

	// если пользователь аутентифицирован в сеансе, продолжить
	if (req.isAuthenticated())
		return next();


	res.redirect('/');
}
