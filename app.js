const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Baby = require('./models/Baby');
const checkBabyProfile = require('./middleware/checkBabyProfile');
const indexRoutes = require('./routes/index');
const chatBotRoutes = require('./routes/chatBot'); // ✅ Import chatbot routes
require('dotenv').config(); 


mongoose.connect('mongodb://localhost:27017/growbabyDB')
.then(() => {
    console.log("Mongo Connection open");
})
.catch(err => {
    console.log("Mongo Error");
    console.log(err);
});

// mongoose.connect(process.env.MONGO_URI) // 
// .then(() => {
//     console.log("Mongo Connection open");
// })
// .catch(err => {
//     console.log("Mongo Error", err);
// });


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))

// Apply checkBabyProfile to all routes
app.use(checkBabyProfile);

app.use('/', indexRoutes);
app.use('/', chatBotRoutes); // ✅ Mount chatbot routes

app.listen(3000, () => {
    console.log("Serving on port 3000")
});
