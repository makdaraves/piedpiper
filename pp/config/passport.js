

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
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

// expose this function to our app using module.exports
module.exports = function(passport) {

    // passport session setup 

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
		done(null, user.id);
    });

    // used to deserialize the user
    
        passport.deserializeUser(function(id, done) {
            //Строим запрос в базу данных(ищем id пользователя,полученного из стратегии)
      connection.query("SELECT * FROM users WHERE id='"+id+"'",function(err,res){
          console.log(id);	
        done(null, id);
    });
      
    });

  
    // LOCAL SIGNUP 
    

    passport.use(
        'local-signup',
        new LocalStrategy({
            
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // позволяет передать весь запрос обратному вызову
        },
        function(req, username, password, done) {
            
            // существует ли уже пользователь
            
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'Этот логин уже используется.'));
                } else {
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: password,
                        id: `f${(~~(Math.random()*1e8)).toString(16)}`
                    };
			
                    var insertQuery = "INSERT INTO users (id, username, password ) values (?,?,?)";
                
                    connection.query(insertQuery, [newUserMysql.id, newUserMysql.username, newUserMysql.password], function (err, rowsf) {
                        return done(null, newUserMysql);
				});	
            }	
		});
    }));
            


    
    // LOCAL LOGIN 
  

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
           
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Пользователь с таким логином не найден')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!( rows[0].password == password))
                return done(null, false, req.flash('loginMessage', 'Неверный пароль')); // create the loginMessage and save it to session as flashdata
			
            // all is well, return successful user
            return done(null, rows[0]);			
		
		});
          
        })
    );
};
