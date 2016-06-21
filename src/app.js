var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');
var d = Settings.data('data');

var colourScheme = 'white';

//subjects[week][day][period][name/room]
var subjects = [
  [[ ['Free'       ,'--' ], ['Maths'      ,'608'], ['Physics','602'], ['Free'       ,'--' ], ['English','401'] ], //Mon
   [ ['Maths'      ,'103'], ['Engineering','505'], ['Maths'  ,'107'], ['Free'       ,'--' ], ['English','401'] ], //Tue
   [ ['English'    ,'401'], ['Maths'      ,'107'], ['Physics','602'], ['Sport'      ,'--' ], ['Sport'  ,'--' ] ], //Wed
   [ ['Free'       ,'--' ], ['Engineering','504'], ['Physics','602'], ['Free'       ,'--' ], ['Free'   ,'--' ] ], //Thu
   [ ['Engineering','214'], ['Maths'      ,'108'], ['English','207'], ['Physics'    ,'602'], ['Free'   ,'--' ] ]  //Fri
  ],
  [[ ['Physics'    ,'602'], ['Maths'      ,'104'], ['Free'   ,'--' ], ['English'    ,'207'], ['Free'   ,'--' ] ], //Mon
   [ ['Free'       ,'--' ], ['English'    ,'209'], ['Maths'  ,'105'], ['Engineering','505'], ['Maths'  ,'108'] ], //Tue
   [ ['Physics'    ,'602'], ['Free'       ,'--' ], ['English','401'], ['Sport'      ,'--' ], ['Sport'  ,'--' ] ], //Wed
   [ ['Maths'      ,'108'], ['Engineering','504'], ['Physics','704'], ['Free'       ,'--' ], ['Free'   ,'--' ] ], //Thu
   [ ['Maths'      ,'104'], ['Free'       ,'--' ], ['Maths'  ,'104'], ['Engineering','504'], ['Physics','602'] ]  //Fri
  ],
  [[ ['Engineering','504'], ['Maths'      ,'105'], ['Physics','602'], ['Maths'      ,'608'], ['English','401'] ], //Mon
   [ ['Engineering','504'], ['Maths'      ,'108'], ['Maths'  ,'603'], ['English'    ,'801'], ['Free'   ,'--' ] ], //Tue
   [ ['Engineering','505'], ['Free'       ,'--' ], ['English','401'], ['Sport'      ,'--' ], ['Sport'  ,'--' ] ], //Wed
   [ ['Free'       ,'--' ], ['Engineering','214'], ['Physics','602'], ['Free'       ,'--' ], ['Free'   ,'--' ] ], //Thu
   [ ['Physics'    ,'602'], ['Maths'      ,'104'], ['English','507'], ['Engineering','504'], ['Free'   ,'--' ] ]  //Fri
  ]
];
var dayDict = {'Monday':0, 'Tuesday':1, 'Wednesday':2, 'Thursday':3, 'Friday':4};
var weekDict = {'A':0, 'B':1, 'C':2};

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
//Setup
var main = new UI.Window({
    fullscreen: true,
  });
var size = main.size();
var background = new UI.Rect({
  position: new Vector2(0, 0),
  size: size,
});
var datefield = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(size.x, 25),
  font: 'gothic-18-bold',
  text: 'Monday 1A',
  textAlign: 'center',
});
var classfield = new UI.Text({
  position: new Vector2(0, 35),
  size: new Vector2(size.x, 30),
  font: 'gothic-28',
  text: 'Class',
  textAlign: 'center'
});
var infield = new UI.Text({
  position: new Vector2(0, 65),
  size: new Vector2(size.x, 30),
  font: 'gothic-24',
  text: 'starts in',
  textAlign: 'center'
});
var cdfield = new UI.Text({
  position: new Vector2(0, 92),
  size: new Vector2(size.x, 30),
  font: 'gothic-28',
  text: '--h --m --s',
  textAlign: 'center'
});
var roomfield = new UI.Text({
  position: new Vector2(0, size.y - 20),
  size: new Vector2(size.x, 30),
  font: 'gothic-14',
  text: ' Room: --',
  textAlign: 'left'
});

if (colourScheme == 'white') {
  background.backgroundColor('white');
  datefield.color('white');
  datefield.backgroundColor('black');
  classfield.color('black');
  infield.color('black');
  cdfield.color('black');
  roomfield.color('black');
} else {
  background.backgroundColor('black');
  datefield.color('black');
  datefield.backgroundColor('white');
  classfield.color('white');
  infield.color('white');
  cdfield.color('white');
  roomfield.color('white');
}
main.add(background);
main.add(datefield);
main.add(classfield);
main.add(infield);
main.add(cdfield);
main.add(roomfield);

//Get countdown timer
var getCountdown = function() {
  var bName = 'Class';
  var trans = false; //Whether transition bell
  var today = new Date();
  var classTime = new Date();
  classTime.setMonth(parseInt(d.date.slice(5,7)) - 1); //d.date = yyyy-mm-dd
  classTime.setDate(parseInt(d.date.slice(8,10)));
  //Loop through bell times
  for (var i = 0; i < d.bells.length; i++) {
    trans = false;
    var bTime = d.bells[i].time;
    bName = d.bells[i].bell;
    if ((bName == 'Transition') || (bName == 'Lunch 1') || (bName == 'Recess') || (bName == 'End of Day')) {
      bName = d.bells[i-1].bell;
      trans = true;
    }
    if (bName == 'Roll Call') {
      bName = 'School';
    }
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
  var classDetails = subjects[weekDict[d.weekType]][dayDict[d.day]][parseInt(bName) - 1];
  
  datefield.text(d.day + ' ' + d.week + d.weekType);
  classfield.text(classDetails[0]);
  if (trans) {infield.text('ends in');} else {infield.text('starts in');}
  if (diffHrs == '00') {
    if (diffMins == '00') {
      cdfield.text(diffSecs + 's');
    } else {
      cdfield.text(diffMins + 'm ' + diffSecs + 's');
    }
  } else {
    cdfield.text(diffHrs + 'h ' + diffMins + 'm ' + diffSecs + 's');
  }
  roomfield.text(' Room: ' + classDetails[1]);
};
setInterval(getCountdown, 1000);

main.on('show', function() {
  update();
});

main.show();

//BELLTIMES
var bellTimes = new UI.Menu({
  fullscreen: true,
  sections: [{
    title: 'Belltimes',
    items: [{title: 'Loading...'}]
  }]
});

var getBellTimes = function() {
  var bellList = [];
  if (d.bellsAltered) {
    bellList.push({title: 'Bells changed', subtitle: d.bellsAlteredReason});
  }
  for(var i = 0; i < d.bells.length; i++) {
    var title = d.bells[i].bell;
    var time = convertTime(d.bells[i].time);
    if (title.length == 1) {title = 'Period ' + title;}
    if (title != 'Transition') {
      bellList.push({title: title, subtitle: time});
    }
  }
  return bellList;
};

bellTimes.items(0,getBellTimes());

//Today's Timetable
var timetable = new UI.Menu({
  fullscreen: true,
  sections: [{
    title: 'Timetable',
    items: [{title: 'Loading...'}]
  }]
});

var getTimetable = function() {
  var dayTimetable = subjects[weekDict[d.weekType]][dayDict[d.day]];
  console.log(dayTimetable);
  var timeList = [];
  for (var i = 0; i < dayTimetable.length; i++) {
    timeList.push({title: dayTimetable[i][0], subtitle: 'Room: ' + dayTimetable[i][1]});
  }
  return timeList;
};

timetable.items(0,getTimetable());

main.on('click', 'up', function(e) {
  bellTimes.show();
});

main.on('click', 'select', function(e) {
  timetable.show();
});
