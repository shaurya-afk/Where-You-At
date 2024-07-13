const express = require('express');
const app = express();
const bodyParser = require('body-parser');


// socket.io boiler plate
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const server = http.createServer(app);
const io = socket(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


io.on('connection', function (socket){
	socket.on("send-location", function(data){
		io.emit("receive-location",{id: socket.id, ...data})
	});

	socket.on('disconnect',function(){
		io.emit('user-disconnect', socket.id);
	});
	console.log('connected!!!');
});

app.get('/', (req, res) => {
	res.render('login');
});

app.get('/map', (req, res) => {
	const username = req.query.username;
	res.render('index',{username:username});
});


server.listen(3000);