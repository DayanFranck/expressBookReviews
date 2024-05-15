const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
app.use(express.json());
app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Retrieve the access token from the session
    const token = req.session.token;

    // Check if the token exists
    if (!token) {
        return res.status(401).send('Access Denied: No token provided');
    }

    // Verify the token
    jwt.verify(token, 'fingerprint_customer', (err, decoded) => {
        if (err) {
            return res.status(401).send('Access Denied: Invalid token');
        } else {
            // If everything is good, save the request for use in other routes
            req.user = decoded;
            next();
        }
    });
});

const PORT =5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.listen(PORT,()=>console.log("Server is running"));
