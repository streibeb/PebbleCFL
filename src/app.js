var UI = require('ui');
var Ajax = require('ajax');
var Vector2 = require('vector2');

var refreshInterval = 900000;

// Show splash
var splashCard = new UI.Card({
  title: "Please Wait",
  body: "Downloading...",
  icon: 'images/logo_bw.png'
});
//splashCard.show();

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
setInterval(function () {GetSchedule();}, refreshInterval);

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
          var game = new UI.Card({
            title: selectedWeek.name,
            body: selectedGame.Date + "\n" + 
              selectedGame.AwayTeamShort + " - " + selectedGame.AwayScore + 
              "\n@\n" + 
              selectedGame.HomeTeamShort + " - " + selectedGame.HomeScore
          });
          
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