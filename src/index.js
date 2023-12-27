const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { collectionModel, adminModel } = require('./config');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');


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

// stop caching
app.use(nocache());




//home router
app.get( '/', ( req, res)=> {
    if(req.session.user){
        const user = collectionModel.findOne({email: req.session.email})
        console.log(user);
        res.render('home', { user });
    }else{
        res.redirect('/login');
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
            res.redirect('/');
        }
        const emailCheck = await collectionModel.findOne({ email: req.body.email });

        if( !emailCheck ){
            res.send('user email cannot found')
        }

        const isPasswordMatch = await bcrypt.compare( req.body.password, emailCheck.password );
        if( isPasswordMatch ){
            req.session.user = req.body.email;
            res.status(200).redirect('/');
        }else{
            res.send(' wrong password');
        }
    }catch(err){
        console.log(err);
    }
});



app.post('/search', async ( req, res)=> {
    try{
        const { search } = req.body;
        console.log( search );
        const filteredUsers = await collectionModel.find({
            $or: [
                { username: { $regex: new RegExp( search, 'i' )} },
                { email: { $regex: new RegExp( search, 'i') } },
            ]
        }, 
        { email: 1, username: 1, _id: 1, password: 1});
        console.log(filteredUsers);
        // if(!user){
        //     const hline = document.querySelector('[h-row-line]');
        // }

        res.render('admin', { user: filteredUsers });

        }
        catch(err){
            console.log(err);
        }
})



app.get( '/admin-login', (req, res)=> {
    if(req.session.admin){
        res.redirect('/admin');
    }else {
        res.render('admin-login');
    }
})



app.post( '/admin-login', async ( req, res)=> {
   
    try{
        const emailCheck = await adminModel.findOne({ email: req.body.email });

        if( !emailCheck ){
            res.send('admin email not found')
        }

        const isAdmPass = await bcrypt.compare( req.body.password, emailCheck.password );
        if( isAdmPass ){
            if(isAdmPass){
                console.log(`password correct`);
               req.session.admin = req.body.email;
               res.redirect('/admin');
            }else {
                console.log('password incorrect');
                res.redirect('/admin-login');
            }
        }else{
            res.send(' wrong password');
        }
    }catch(err){
        console.log(err + 'hai');
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




// add-user router
app.get('/admin', async ( req, res) => {
    
    try{
         if(req.session.admin){
            const userData = await collectionModel.find({})
            res.status(200).render('admin', { user: userData });
         }else {
            res.redirect('/admin-login');
         }
     }catch(err) {
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




// session destroy
app.get('/logout', ( req, res)=> {

        delete req.session.user;
            
        console.log('user session destroyed');
        res.redirect('/');
            
});


// admin session destroy
app.get('/logout-admin', ( req, res)=> {

    delete req.session.admin;
        
    console.log('admin ession destroyed');
    res.redirect('/admin-login');
        
    
});


// app.get('/edit', (req, res)=> {
//     const userData = req.body;
//     res.render('edit', { user: userData });
// })



// edit user
app.get( `/edit/:id`, async (req, res)=> {
    let { id } = req.params;
    console.log(id);
    await collectionModel.findById(id)
        .then((user)=> {
            if(user == null){
                console.log('failer');
                res.redirect('/admin');
            }else {
                console.log('success');
                res.render('edit', { user: user });
            }
        })
        .catch((err)=> {
            console.log(err);
        })
});

app.post( '/edit/:id', async ( req, res)=> {
    const userId = req.params.id;
    const userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }
    await collectionModel.updateOne({ _id: userId}, userData )
        .then((result)=> {
            console.log(result);
            res.send( `success `);
        })
        .catch((err)=> {
            console.log(err);
        })

});


// delete users
app.get( '/delete/:id', async ( req, res)=> {
    const userId = req.params.id;
    console.log(userId);
    const userData = await collectionModel.findByIdAndDelete(userId)
        .then((user)=> {
            res.redirect('/admin');
        })
        .catch((err)=> {
            console.log(err);
        })
});





const PORT = 5000;
app.listen( PORT, ()=> console.log(`server running on port http://localhost:${PORT}`));