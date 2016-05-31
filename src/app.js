var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');
var d = Settings.data('data');

//Update data
var update = function() {
  ajax(
      {
        url: 'https://student.sbhs.net.au/api/timetable/bells.json',
        type: 'json'
      },
      function(data) {
        Settings.data('data', data);
        d = Settings.data('data');
      },
      function(error) {
        console.log('Error: ' + error);
      }
  );
};

//Pad 0s
var pad = function(num) {
    return ('00' + num).slice(-2);
};

//24h to 12h
var convertTime = function(time) {
  var hour = parseInt(time.slice(0,2));
  if (hour < 12) {
    time = time + ' AM';
  } else if (hour == 12) {
    time = time + ' PM';
  } else {
    hour = hour - 12;
    time = hour.toString() + time.slice(2) + ' PM';
  }
  return time;
};

//MAIN
var main = new UI.Window({
    fullscreen: true,
  });
var size = main.size();

var datefield = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(size.x, 25),
  font: 'gothic-18-bold',
  text: 'Monday 1A',
  textAlign: 'center',
  color: 'black',
  backgroundColor: 'white'
});
var classfield = new UI.Text({
  position: new Vector2(0, 35),
  size: new Vector2(size.x, 30),
  font: 'gothic-28',
  text: 'Class',
  textAlign: 'center'
});
var infield = new UI.Text({
  position: new Vector2(0, 68),
  size: new Vector2(size.x, 30),
  font: 'gothic-18',
  text: 'starts in',
  textAlign: 'center'
});
var cdfield = new UI.Text({
  position: new Vector2(0, 90),
  size: new Vector2(size.x, 30),
  font: 'gothic-28',
  text: '--h --m --s',
  textAlign: 'center'
});
var sbhsfield = new UI.Text({
  position: new Vector2(0, size.y - 20),
  size: new Vector2(size.x, 30),
  font: 'gothic-14',
  text: 'SBHS Timetable',
  textAlign: 'left'
});

main.add(datefield);
main.add(classfield);
main.add(infield);
main.add(cdfield);
main.add(sbhsfield);

var getCountdown = function() {
  var today = new Date();
  var classTime = new Date();
  classTime.setMonth(parseInt(d.date.slice(5,7)));
  classTime.setDate(parseInt(d.date.slice(8,10)));
  var bName = 'Class';
  var trans = false;
  //Loop through bell times
  for (var i = 0; i < d.bells.length; i++) {
    var bTime = d.bells[i].time;
    bName = d.bells[i].bell;
    if (bName == 'Transition') {bName = d.bells[i-1].time; trans = true;}
    if (bName == 'Roll Call') {bName = 'School';}
    if (bName.length == 1) {bName = 'Period ' + bName;}
    classTime.setHours(parseInt(bTime.slice(0,2)));
    classTime.setMinutes(parseInt(bTime.slice(3,5)));
    classTime.setSeconds(0);
    if (classTime > today) {break;}
  }
  //Calculate time difference
  var diffMs = (classTime - today);
  var diffHrs = pad(Math.floor((diffMs % 86400000) / 3600000)); // hours
  var diffMins = pad(Math.floor(((diffMs % 86400000) % 3600000) / 60000)); // minutes
  var diffSecs = pad(Math.floor((((diffMs % 86400000) % 3600000 % 60000) / 1000))); // seconds
  datefield.text(d.day + ' ' + d.week + d.weekType);
  classfield.text(bName);
  if (trans) {infield.text('ends in');} else {infield.text('starts in');}
  cdfield.text(diffHrs + 'h ' + diffMins + 'm ' + diffSecs + 's');
};

main.on('show', function() {
  update();
  setInterval(getCountdown, 1000);
});

main.show();

//BELLTIMES
var bellMenu = new UI.Menu({
  sections: [{
    title: 'Belltimes',
    items: [{
      title: 'Loading:'
    }]
  }],
  status: {
    separator: 'none',
    color: 'white',
    backgroundColor: 'black'
  }
});

var getBellTimes = function(data) {
  var items = [];
  
  if (data.status == 'OK') {
    //Changed bell times
    if (data.bellsAltered) {
      items.push({
        title: 'Bells changed',
        subtitle: items.bellsAlteredReason
      });
    }
    //Get bell times
    for(var i = 0; i < data.bells.length; i++) {
      var title = data.bells[i].bell;
      var time = convertTime(data.bells[i].time);
      if (title.length == 1) {title = 'Period ' + title;}
      if (title != 'Transition') {
        items.push({
          title:title,
          subtitle:time
        });
      }
    }
  } else {
      items.push({
        title: 'No Bells Today'
      });
  }
  return items;
};

//BELLTIMES2
var bellTimes = new UI.Window({
  fullscreen: true
});
var size = bellTimes.size();
var titlefield = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(size.x, 25),
  font: 'gothic-18-bold',
  text: 'Belltimes',
  textAlign: 'center',
  color: 'black',
  backgroundColor: 'white'
});

var namefield = new UI.Text({
  position: new Vector2(0, 30),
  size: new Vector2(size.x, 300),
  font: 'gothic-24',
  text: 'Bell times',
  textAlign: 'left'
});

var timefield = new UI.Text({
  position: new Vector2(0, 30),
  size: new Vector2(size.x, 300),
  font: 'gothic-24',
  text: '--:--AM',
  textAlign: 'right'
  });

bellTimes.add(namefield);
bellTimes.add(timefield);
bellTimes.add(titlefield);

var displayBellTime = function(data) {
  var bellList = [];
  var timeList = [];
  for(var i = 0; i < data.bells.length; i++) {
    var title = data.bells[i].bell;
    var time = convertTime(data.bells[i].time);
    if (title.length == 1) {title = 'Period ' + title;}
    if (title != 'Transition') {
      bellList.push(title);
      timeList.push(time);
    }
  }
  namefield.text(' '+ bellList.join('\n '));
  timefield.text(timeList.join(' \n') + ' ');
};

var scrollBellScreen = function(direction) {
  var pos = namefield.position();
  if (direction && pos.y < 20) {
    pos.y += 30;
  } 
  if (!direction && pos.y > -80) {
    pos.y -= 30;
  }
  namefield.animate('position', pos, 500);
  timefield.animate('position', pos, 500);
};

main.on('click', 'up', function(e) {
  update();
  bellMenu.items(0, getBellTimes(d));
  bellMenu.show();
});

main.on('click', 'select', function(e) {
  update();
  displayBellTime(d);
  bellTimes.show();
});

bellTimes.on('click', 'up', function(e) {
  scrollBellScreen(true);
});

bellTimes.on('click', 'down', function(e) {
  scrollBellScreen(false);
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});