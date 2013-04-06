var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

var roomTemp  = 15;

var kettle = {
  name: 'Quentin',
	disposition: 'happy',
	temperature: 15,
	status: 'idle',
	unit: 'deg'
}

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(418);
    res.end(data);
  });
}
var intervalID;
io.sockets.on('connection', function (socket) {
  socket.emit('kettle', kettle);

  socket.on('startBoil', function (data) {
    console.log(data);
    kettle.status='boiling';
    socket.emit('boilStarted', kettle);
    intervalID =setInterval(boil,1000, socket);
  });

  socket.on('changeWater', function (data) {
    kettle.status='idle';
    kettle.disposition='happy',
    kettle.temperature=roomTemp;
    socket.emit('kettle', kettle);
    if (intervalID) clearInterval(intervalID);
  });

});
function boil(socket) {

  if (kettle.temperature < 100) {
    if (kettle.temperature < 25) {
      kettle.disposition = 'turned on';
    }
    else if (kettle.temperature < 50) {
      kettle.disposition = 'luke warm';
    }
    else if (kettle.temperature < 75) {
      kettle.disposition = 'steamy';
    }
    else {
      kettle.disposition = 'hot for you';
    }
    kettle.temperature = kettle.temperature +5;
    socket.emit('boilProgress', kettle);
  }
  else {
    kettle.disposition = 'done';
    kettle.status = 'idle';
    socket.emit('boilDone', kettle);

    clearInterval(intervalID);
  }
}


