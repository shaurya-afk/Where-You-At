const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
uuidv4();

// socket.io boiler plate
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const server = http.createServer(app);
const io = socket(server);

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const users = {};

io.on('connection', function (socket){
	socket.on("send-location", function(data){
		io.emit("receive-location",{id: socket.id, ...data});
		delete users[socket.id];
	});

	socket.on('disconnect',function(){
		io.emit('user-disconnect', socket.id);
	});
});

app.get('/', (req, res) => {
	const id = uuidv4();
	console.log(`your unique key: ${id}`);
	res.render('login', {id});
});

app.get('/map', (req, res) => {
	const username = req.query.username;
	const id = req.query.id;
	res.render('index',{username, id});
});


server.listen(3000);