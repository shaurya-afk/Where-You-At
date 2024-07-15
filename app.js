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
const keys = {};

io.on('connection', function (socket){
	socket.on("send-location", function(data){
		io.emit("receive-location",{id: socket.id, ...data});
		delete users[socket.id];
	});

	const uniqueKey = uuidv4();
	keys[uniqueKey] = socket.id;
	socket.emit('unique-key', uniqueKey);

	socket.on('disconnect',function(){
		const username = users[socket.id];
		io.emit('user-disconnect', {id: socket.id, name: username});
	});
});

app.get('/', (req, res) => {
	res.render('login');
});

app.get('/host', (req, res) => {
	const username = req.query.username;
	const id = uuidv4();
	res.render('index',{username, id});
});

app.get('/join', (req, res) => {
	const {unique_key, guest_name} = req.query;
	const socket_id = keys[unique_key];
	if(socket_id){
		res.render('index',{username: guest_name, id: socket_id});
	}else{
		res.render('notFound',{id:socket_id});
	}
})

server.listen(3000, () => {console.log('starting on port 3000...')});