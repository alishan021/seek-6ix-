const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { collectionModel, adminModel } = require('./config');
const session = require('express-session');
const cookieParser = require('cookie-parser');


// creating app instance for express
const app = express();

// template engine setting up
app.set( 'view engine' , 'ejs');

// setting views path
// const viewPath = path.join( __dirname + 'views');
app.set( 'views', path.join( __dirname , '../views'));

// convert data into json format
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// static path
app.use(express.static('public'));

// using sessions
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
}));

// cookie parsding;
app.use(cookieParser());




//home router
app.get( '/', ( req, res)=> {
    if(req.session.user){
        res.render('home');
    }else{
        res.render('login', { status: 'you are not logged in'});
    }
})



// signup get
app.get( '/signup', ( req, res)=> {
    res.render('signup');
})


// signup post
app.post( '/signup', async ( req, res)=> {

    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        repassword: req.body.repassword
    }

    // checking password equality.
    if(data.password != data.repassword){
        res.send(` password doesn't match`);
    }else{
        // checking if user already exists
        const existUser = await collectionModel.findOne({ email: data.email });

        if(existUser){
            res.send('user already exists');
        }else{
            // hasing passwords
            const saltRounds = 10; // saltrounds count for bcrypt
            const hashedPass = await bcrypt.hash( data.password, saltRounds);

            data.password = hashedPass; // changing original password to hashed password
            const userdata = await collectionModel.create(data);
        console.log( userdata);

        res.status(200).redirect('/');
        }
    }
});




//login routes
app.get( '/login', ( req, res) => {

    res.status(200).render('login');
});

app.post( '/login', async ( req, res)=> {
   
    try{
        if(req.session.user){
            res.redirect('/home');
        }
        const emailCheck = await collectionModel.findOne({ email: req.body.email });

        if( !emailCheck ){
            res.send('user email cannot found')
        }

        const isPasswordMatch = await bcrypt.compare( req.body.password, emailCheck.password );
        if( isPasswordMatch ){
            req.session.user = req.body.email;
            res.status(200).render('home');
        }else{
            res.send(' wrong password');
        }
    }catch(err){
        console.log(err);
    }
});






// add-user router
app.get('/admin', async ( req, res) => {
    
   try{
        const user = await collectionModel.find({})
        console.log(user);
        res.status(200).render('admin', { user: user });
    }catch(err) {
        console.log(user);
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
       
});


// add user
app.get( '/add', ( req, res)=> {
    res.render('add');
})


app.post( '/add', async ( req, res)=> {

    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        repassword: req.body.repassword
    }

        // checking if user already exists
        const existUser = await collectionModel.findOne({ email: data.email });

        if(existUser){
            res.send('user already exists');
        }else{
            // hasing passwords
            const saltRounds = 10; // saltrounds count for bcrypt
            const hashedPass = await bcrypt.hash( data.password, saltRounds);

            data.password = hashedPass; // changing original password to hashed password
            const userdata = await collectionModel.create(data);
        console.log( userdata);

        res.status(200).redirect('admin');
        // }
    }

});



// edit-user
// app.get( 'edit', (req, res)=> {

// })




// session destroy
app.get('/logout', ( req, res)=> {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        req.session.destroy((err) => {
            if(err){
                console.log(err);
            }else{
                console.log('session destroyed');
                res.redirect('/');
            }
        })
})



app.get( '/admin-login', (req, res)=> {
    res.render('admin-login');
})



app.post( '/admin-login', async ( req, res)=> {
   
    try{
        const emailCheck = await adminModel.findOne({ email: req.body.email });

        if( !emailCheck ){
            res.send('admin email not found')
        }

        const isAdmPass = await bcrypt.compare( req.body.password, emailCheck.password );
        if( isAdmPass ){
            req.session.adminSession = true;
            console.log(req.session.adminSession);
            if(isAdmPass){
            res.status(200).render('admin');
            }else {
                res.redirect('admin-login');
            }
        }else{
            res.send(' wrong password');
        }
    }catch(err){
        console.log(err);
    }
});



app.get('/admin-signup', ( req, res)=> {
    res.render('admin-signup');
});



app.post( '/admin-signup', async ( req, res)=> {

    const adminData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        repassword: req.body.repassword
    }

    // checking password equality.

    if(adminData.password != adminData.repassword){
        res.send(` password doesn't match`);
    }else{
        // checking if user already exists
        const existAdmin = await adminModel.findOne({ email: adminData.email });

        if(existAdmin){
            res.send('user already exists');
        }else{
            // hasing passwords
            const saltRounds = 10; // saltrounds count for bcrypt
            const hashedPass = await bcrypt.hash( adminData.password, saltRounds);

            adminData.password = hashedPass; // changing original password to hashed password
            const Admdata = await adminModel.create(adminData);
        console.log( Admdata);

        res.status(200).redirect('/admin');
        }
    }
});


app.get('/test', async ( req, res)=> {
    const userdata = await collectionModel.find({});
    console.log(userdata);
    res.send('success');
})




const PORT = 5000;
app.listen( PORT, ()=> console.log(`server running on port http://localhost:${PORT}`));