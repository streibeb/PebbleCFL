var UI = require('ui');
var Ajax = require('ajax');
var Vector2 = require('vector2');

var refreshInterval = 15; // in Minutes

// Show splash
var splash = new UI.Window({fullscreen: true});
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
setInterval(function () {GetSchedule();}, refreshInterval * 60000);

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
  var URL = "http://streibel.ca/CFLSchedule/GetSchedule.php?time_zone=eastern";
  // Download data
  Ajax({url: URL, type: 'json'},
    function(responseText) {   
      var menuItems = parseFeed(responseText, responseText.length);
      
      var mainMenu = new UI.Menu({
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
        var weekMenu = new UI.Menu({
          sections: [{
            title: selectedWeek.name,
            items: weekItems
          }]
        });
        
        weekMenu.on('select', function(event) {
          var selectedGame = selectedWeek.games[event.itemIndex];
          var game = new UI.Window({
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
          game.add(weekHeader);
          var awayTitle = new UI.Text({
            position: new Vector2(10, 30),
            size: new Vector2(57, 20),
            textAlign: 'center',
            color: 'black',
            text: 'AWAY'
          });
          game.add(awayTitle);
          var homeTitle = new UI.Text({
            position: new Vector2(77, 30),
            size: new Vector2(57, 20),
            textAlign: 'center',
            color: 'black',
            text: 'HOME'
          });
          game.add(homeTitle);
          var awayScore = new UI.Text({
            position: new Vector2(10, 55),
            size: new Vector2(57, 40),
            font: 'bitham-42-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.AwayScore
          });
          game.add(awayScore);
          var homeScore = new UI.Text({
            position: new Vector2(77, 55),
            size: new Vector2(57, 40),
            font: 'bitham-42-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.HomeScore
          });
          game.add(homeScore);
          var awayTeam = new UI.Text({
            position: new Vector2(10, 100),
            size: new Vector2(57, 20),
            font: 'gothic-24-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.AwayTeamShort
          });
          game.add(awayTeam);
          var homeTeam = new UI.Text({
            position: new Vector2(77, 100),
            size: new Vector2(57, 20),
            font: 'gothic-24-bold',
            textAlign: 'center',
            color: 'black',
            text: selectedGame.HomeTeamShort
          });
          game.add(homeTeam);
          var date = new UI.Text({
            position: new Vector2(0, 130),
            size: new Vector2(144, 40),
            textAlign: 'center',
            backgroundColor: 'black',
            color: 'white',
            text: selectedGame.Date
          });
          game.add(date);
          
          game.show();
        });
        
        weekMenu.show();
      });
  
      mainMenu.show();
      splash.hide();
    },
    function(error) {
      console.log('Ajax failed: ' + error);
    }
  );
}