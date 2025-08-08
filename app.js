const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Baby = require('./models/Baby');
const checkBabyProfile = require('./middleware/checkBabyProfile');
const indexRoutes = require('./routes/index');
const chatBotRoutes = require('./routes/chatBot');
const nutritionRoutes = require('./routes/nutrition');
const resourcesRoutes = require('./routes/resources');
const milestoneRoutes = require('./routes/milestone'); // New line
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

app.use(express.json()); // for JSON
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));


// Apply checkBabyProfile to all routes
app.use(checkBabyProfile);

app.use('/', indexRoutes);

app.use('/chatbot', chatBotRoutes); // ✅ Mount chatbot routes under /chatbot 

app.use('/',nutritionRoutes);
app.use('/',resourcesRoutes);

app.use('/', milestoneRoutes); // New line

app.listen(3000, () => {
    console.log("Serving on port 3000")
});