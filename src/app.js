var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');

var load = new UI.Card({
  title: 'Loading...',
});
load.show();

ajax(
    {
      url: 'https://student.sbhs.net.au/api/timetable/bells.json',
      type: 'json'
    },
    function(data) {
      Settings.data('data', data);
    },
    function(error) {
      console.log('Error: ' + error);
    }
);

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

var getBellTimes = function(data) {
  var items = [];
  
  if (data.status == 'OK') {
    //Changed bell times
    if (data.bellsAltered) {
      items.push({
        title: 'Bell times changed',
        subtitle: items.bellsAlteredReason
      });
    }
    //Get bell times
    for(var i = 0; i < data.bells.length; i++) {
      var title = data.bells[i].bell;
      var time = convertTime(data.bells[i].time);
      if (title.length == 1) {
        title = 'Period ' + title;
      }
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



//MAIN
var d = Settings.data('data');

var main = new UI.Card({
  title: d.day + ' ' + d.week + d.weekType,
  subtitle: 'Class starts in --:--:--',
});
load.hide();
main.show();



var getCountdown = function() {
  var today = new Date();
  var classTime = new Date();
  var bName;
  for (var i = 0; i < d.bells.length; i++) {
    var bTime = d.bells[i].time;
    bName = d.bells[i].bell;
    if (bName.length == 1) {
        bName = 'Period ' + bName;
      }
    if (bName != 'Transition') {
      classTime.setHours(parseInt(bTime.slice(0,2)));
      classTime.setMinutes(parseInt(bTime.slice(3,5)));
      classTime.setSeconds(0);
      if (classTime > today) {break;}
    }
  }
  var diffMs = (classTime - today); // milliseconds between now & Christmas
  var diffHrs = Math.round((diffMs % 86400000) / 3600000); // hours
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  var diffSecs = Math.round((((diffMs % 86400000) % 3600000 % 60000) / 1000)); // seconds
  
  main.subtitle(bName + ' starts in ' + diffHrs + ':' + diffMins + ':' + diffSecs + '.');
};

//BELLTIMES
var bellMenu = new UI.Menu({
  sections: [{
    title: 'Belltimes',
    items: [{
      title: 'Loading:'
    }]
  }]
});

main.on('click', 'up', function(e) {
  bellMenu.items(0, getBellTimes(d));
  bellMenu.show();
});

setInterval(getCountdown, 1000);

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