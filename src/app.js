var UI = require('ui');
var Ajax = require('ajax');
var Vector2 = require('vector2');
var Light = require('ui/light');

var init = true;
var timezone = localStorage.getItem('timezone');
var refreshInterval = 1; // in Minutes
var refreshTimer;

// Screens of application
var splash = null;
var gameScreen = null;
var weekMenu = null;
var mainMenu = null;

Pebble.addEventListener('showConfiguration', function(e) {
  // Show config page
  Pebble.openURL('http://streibel.ca/CFLSchedule/PebbleCFL_settings.html');
  Pebble.addEventListener("webviewclosed", function(e) {
    // webview closed
    
    init = true;
    splash.show();
    if (gameScreen) {
      gameScreen.hide();
    } 
    if (weekMenu) {
      weekMenu.hide();
    } 
    if (mainMenu) {
      mainMenu.hide();
    } 
    
    var options = JSON.parse(decodeURIComponent(e.response));
    timezone = options.timezone;
    localStorage.setItem('timezone', timezone);
    
    GetSchedule();
  }); 
});

// Show splash
splash = new UI.Window({fullscreen: true});
var image = new UI.Image({
  position: new Vector2(10, 0),
  size: new Vector2(124, 144),
  image: 'images/logo_bw.png'
});
splash.add(image);
var text = new UI.Text({
  position: new Vector2(40, 135),
  size: new Vector2(144, 24),
  text: 'Loading...'
});
splash.add(text);
splash.show();

GetSchedule();

var getDate = function() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  } 
  if(mm<10){
      mm='0'+mm;
  }
  var hr = today.getHours();
  var min = today.getMinutes();
  var sec = today.getSeconds();
  console.log(yyyy+'-'+mm+'-'+dd+' '+hr+':'+min+':'+sec);
};

var parseFeed = function(data, quantity) {
  var items = [];
  for(var i = 0; i < quantity; i++) {
    var title = data[i].name;
    
    items.push({
      title:title
    });
  }
  return items;
};

var parseGames = function(data, quantity) {
  var items = [];
  for(var i = 0; i < quantity; i++) {
    var title = data[i].AwayTeamShort + " (" + data[i].AwayScore + ") @ " + data[i].HomeTeamShort + " (" + data[i].HomeScore +")";
    var subtitle = data[i].Date;
    
    items.push({
      title:title,
      subtitle:subtitle
    });
  }
  return items;
};

function GetSchedule() {
  var URL = "http://streibel.ca/CFLSchedule/GetSchedule.php?time_zone="+timezone;
  // Download data
  Ajax({url: URL, type: 'json'},
    function(responseText) {   
      var menuItems = parseFeed(responseText, responseText.length);
      
      mainMenu = new UI.Menu({
        sections: [{
          title: 'CFL Schedule',
          items: menuItems
        }]
      });
      
      var selectedWeek;
      mainMenu.on('select', function(event) {
        //selectedWeek = event.item;
        selectedWeek = responseText[event.itemIndex];
        var weekItems = parseGames(selectedWeek.games, selectedWeek.games.length);
        weekMenu = new UI.Menu({
          sections: [{
            title: selectedWeek.name,
            items: weekItems
          }]
        });
        
        weekMenu.on('select', function(event) {
          var selectedGame = selectedWeek.games[event.itemIndex];
          gameScreen = new UI.Window({
            backgroundColor: 'white',
            fullscreen: true
          });
          var weekHeader = new UI.Text({
            position: new Vector2(0, 0),
            size: new Vector2(144, 30),
            font: 'gothic-24-bold',
            textAlign: 'center',
            backgroundColor: 'black',
            color: 'white',
            text: selectedWeek.name
          });
          gameScreen.add(weekHeader);
          var awayTitle = new UI.Text({
            position: new Vector2(10, 30),
            size: new Vector2(57, 20),
            textAlign: 'center',
            color: 'black',
            text: 'AWAY'
          });
          gameScreen.add(awayTitle);
          var homeTitle = new UI.Text({
            position: new Vector2(77, 30),
            size: new Vector2(57, 20),
            textAlign: 'center',
            color: 'black',
            text: 'HOME'
          });
          gameScreen.add(homeTitle);
          var awayScore = new UI.Text({
            position: new Vector2(10, 55),
            size: new Vector2(57, 40),
            font: 'bitham-42-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.AwayScore
          });
          gameScreen.add(awayScore);
          var homeScore = new UI.Text({
            position: new Vector2(77, 55),
            size: new Vector2(57, 40),
            font: 'bitham-42-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.HomeScore
          });
          gameScreen.add(homeScore);
          var awayTeam = new UI.Text({
            position: new Vector2(10, 100),
            size: new Vector2(57, 20),
            font: 'gothic-24-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.AwayTeamShort
          });
          gameScreen.add(awayTeam);
          var homeTeam = new UI.Text({
            position: new Vector2(77, 100),
            size: new Vector2(57, 20),
            font: 'gothic-24-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.HomeTeamShort
          });
          gameScreen.add(homeTeam);
          var date = new UI.Text({
            position: new Vector2(0, 130),
            size: new Vector2(144, 40),
            textAlign: 'center',
            backgroundColor: 'black',
            color: 'white',
            text: selectedGame.Date
          });
          gameScreen.add(date);
          
          gameScreen.show();
        });
        
        weekMenu.show();
      });
  
      if (init) {
        mainMenu.show();
        splash.hide();
        init = false;
      }
      Light.trigger();
      
      getDate();
      refreshTimer = setTimeout(function () {GetSchedule();}, refreshInterval * 60000);
    },
    function(error) {
      console.log('Ajax failed: ' + error);
    }
  );
}