reg.use(connect.cookieParser());
reg.use(connect.session({ secret: 'good'} ));
