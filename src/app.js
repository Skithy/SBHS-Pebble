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
var main = new UI.Card({
  title: d.day + ' ' + d.week + d.weekType,
  subtitle: 'Class starts\n' +
            '--h --m --s',
  status: {
    separator: 'none',
    color: 'white',
    backgroundColor: 'black'
  }
});

main.on('show', function() {
  update();
});

main.show();

var getCountdown = function() {
  var today = new Date();
  var classTime = new Date();
  classTime.setMonth(parseInt(d.date.slice(5,7)));
  classTime.setDate(parseInt(d.date.slice(8,10)));
  var bName = 'Class';
  var trans = false;
  for (var i = 0; i < d.bells.length; i++) {
    var bTime = d.bells[i].time;
    bName = d.bells[i].bell;
    if (bName == 'Transition') {bName = d.bells[i-1].time; trans = true;}
    if (bName.length == 1) {bName = 'Period ' + bName;}
    classTime.setHours(parseInt(bTime.slice(0,2)));
    classTime.setMinutes(parseInt(bTime.slice(3,5)));
    classTime.setSeconds(0);
    if (classTime > today) {break;}
  }
  var diffMs = (classTime - today);
  var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  var diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000); // minutes
  var diffSecs = Math.floor((((diffMs % 86400000) % 3600000 % 60000) / 1000)); // seconds
  if (trans) {
    main.subtitle(bName + ' ends\n' +
                diffHrs + 'h ' + diffMins + 'm ' + diffSecs + 's');
  } else {
    main.subtitle(bName + ' starts\n' +
                diffHrs + 'h ' + diffMins + 'm ' + diffSecs + 's');
  }
};
setInterval(getCountdown, 1000);


//BELLTIMES
var bellMenu = new UI.Menu({
  sections: [{
    title: 'Belltimes',
    items: [{
      title: 'Loading:'
    }]
  }]
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

main.on('click', 'up', function(e) {
  update();
  bellMenu.items(0, getBellTimes(d));
  bellMenu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    fullscreen: true,
  });
  var textfield = new UI.TimeText({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: '%M:%S',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});