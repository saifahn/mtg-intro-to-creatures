$(document).ready(function() {
  getListAndInitialise();
});

// store the data from the JSON request in a variable
var cardList = [];

// recursive function to add cards to the list
function addToCardList(url) {
  $.getJSON(url, function(listObj) {
    cardList.push(listObj.data);
    if (listObj.has_more) {
      addToCardList(listObj.next_page);
    }
  });
}

// function to get a random card from the list
function getRandomCard(list) {
  // current variable to keep track of where we are
  var current = list;
  var length = current.length;
  // while we are in an array, keep going deeper
  while (length > 1) {
    // choose a random position in the current level
    var randomPos = Math.floor(Math.random() * length);
    current = current[randomPos];
    length = current.length;
  }
  return current;
}

// function to display the current card, used with getRandom often
function displayCurrentCard(card) {
  var currentCard = card;
  var imageLink = currentCard.image_uri;
  var cardImage = "<img src='" + imageLink + "' id='card-img'>";
  // replace the current image with the new one
  document.getElementById("card-container").innerHTML = cardImage;
}

//display text from the card object big function
function displayTextFromCard(card) {
  var imageUrl = card.image_uri;
  var colorsArr = card.colors;
  var cmc = parseInt(card.converted_mana_cost);
  var mana_cost = card.mana_cost;
  var power = card.power;
  var toughness = card.toughness;
  var rarity  = card.rarity;
  var setName = card.set_name;
  var creatureType = card.type_line; // use regex on this? legendary etc.
  var artist = card.artist;
  var oracleText = card.oracle_text;
  var hasColouredManaCost = false;

  var titleName = "<h2>" + card.name + "</h2>";

  var strongName = "<em>" + card.name + "</em>";
  // call the function and display it
  document.getElementById("card-exp").innerHTML = titleName +  makeCostAndColourSection() + makePAndTSection() + makeCreatureTypeSection() + makeSetAndRaritySection() + makeAbilitiesSection();

  // make ABILITIES seection
  function makeAbilitiesSection() {
    var text = "<h3>Abilities</h3><p>Creatures often have special abilities. These are located in the card\'s text box, below the card\'s creature type and are often defined in full. The game has a hefty comprehensive rulebook, available <a href=\"http://magic.wizards.com/en/game-info/gameplay/rules-and-formats/rules\">here</a>.</p>"
    // match a bunch of different matches for abilities
    // TODO
      // flying
      // vigilance
      // lifelink
      // tap symbol {T}
      // trample
      // deathtouch
      // haste
      // menace
      // indestructible
    return text;
  }

  // make SET and RARITY
  function makeSetAndRaritySection() {
    var rarityColour;
    switch (rarity) {
      case "common":
        rarityColour = "black";
        break;
      case "uncommon":
        rarityColour = "blue/silver";
        break;
      case "rare":
        rarityColour = "gold";
        break;
      case "mythic":
        rarityColour = "orange";
        break;
    }
    return "<h3>Set and Rarity</h3><p>On the far right of the creature type line, there is a set symbol that indicates the card\'s rarity and what set it comes from. " + strongName + " is from the <em>" + setName + "</em> set and is " + rarity + ", as indicated by the " + rarityColour + " colour of the symbol.</p>";

  }


  // make POWER and TOUGHNESS section
  function makePAndTSection() {
    return "<h3>Power and Toughness</h3><p>Creatures are used to attack your opponents and block your opponents\' creatures when they attack you. This is where their power and toughness attributes come in. These are located in the lower right corner.</p><p>" + strongName + " has " + power + " power and " + toughness + " toughness. It is a " + power + "/" + toughness + ".";
  }

  // make creatureType
  function makeCreatureTypeSection() {
    var text = "<p>Creatures usually have a creature type, and this is located below the art. There are cards that care about certain types and often grant bonuses and beneficial effects, so look out for them!</p>"
    // if legendary
    if (creatureType.search("Legendary") != -1) {
      text += "<p>When a creature card refers to a named figure from the story or multiverse, it is often given the supertype \'Legendary\'. You may only have one legendary card with the same name on the battlefield at once. If, somehow, you end up with more than one, you choose one and the rest go to your graveyard.</p>"
    }
    // if artifact
    if (creatureType.search("Artifact") != -1) {
      text += "<p>This card is an artifact! Artifact creatures often represent animated constructs and are normally colourless.</p>"
    }
    return "<h3>" + creatureType + "</h3>" + text;
  }

  //make COST and COLOUR sections, return
  function makeCostAndColourSection() {
    var colours = {};
    // get a mana cost string
    var manaCostString = makeManaCostString(mana_cost);
    var colourIdentityString = makeColourIdenString();

    // make a mana cost section
    var manaCostBlock = "<h3>Mana Cost</h3><p>In general, an amount of mana must be paid to cast a spell. (Creatures count as spells while you are summoning them.) " + strongName + "\'s mana cost is in its upper right hand corner. " + manaCostString + " and its converted (total) mana cost is " + cmc + ".</p>";

    // make the colour section
    var colourBlock = "<h3>Colours</h3><p>A card\'s colours is usually determined by its casting cost. " + colourIdentityString + "</p>";

    return manaCostBlock + colourBlock;

    //MANACOST function definition
    function makeManaCostString(string) {
      // if no mana cost
      if (!string)
        return "Unusually, this card has no mana cost. It's probably special."
      // generic match, match the number in the brackets
      var genmatch = /{([X0-9])}/;
      var generic = string.match(genmatch);
      if (generic)
        colours.generic = generic[1];
      // match W, length of match to get number of white
      var Wmatch = /{W}/g;
      var white = string.match(Wmatch);
      if (white) {
        colours.white = white.length;
        hasColouredManaCost = true;
      }
      // match U
      var Umatch = /{U}/g;
      var blue = string.match(Umatch);
      if (blue) {
        colours.blue = blue.length;
        hasColouredManaCost = true;
      }
      // match B
      var Bmatch = /{B}/g;
      var black = string.match(Bmatch);
      if (black) {
        colours.black = black.length;
        hasColouredManaCost = true;
      }
      // match R
      var Rmatch = /{R}/g;
      var red = string.match(Rmatch);
      if (red) {
        colours.red = red.length;
        hasColouredManaCost = true;
      }
      // match G
      var Gmatch = /{G}/g;
      var green = string.match(Gmatch);
      if (green) {
        colours.green = green.length;
        hasColouredManaCost = true;
      }
      // match C
      var Cmatch = /{C}/g;
      var colourless = string.match(Cmatch);
      if (colourless)
        colours.colourless = colourless.length;
      // generate text
      var manacostString = strongName + " costs";
      var costString = "";
      // iterate through the colour object's keys and amounts
      var objectKeysArr = Object.keys(colours);
      for (var i = 0, n = objectKeysArr.length; i < n; i++) {
        var currentKey = objectKeysArr[i];
        // display "2 blue mana"
        costString += " " + colours[currentKey] + " " + currentKey + " mana";
        // if it's the second to last key, add the "and"
        if (i == n-2)
          costString += " and";
        // if not last or second last, add comma
        if (i != n-2 && i != n-1)
          costString += ","
      }
      manacostString += costString;
      // returns the mana cost
      // looks like "This card costs 2 blue mana, 3 black mana, and 2 red mana"
      return manacostString;
    }

    // make a colourIdentitystring
    function makeColourIdenString() {
      // colorless
      if (colorsArr.length == 0 && !hasColouredManaCost) {
        return "This card is colourless."
      }
      // colorless despite coloured?
      if (colorsArr.length == 0 && hasColouredManaCost) {
        return "However, this card has an ability that makes it colourless."
      }
      // iterate through the colour object's keys and amounts
      var objectKeysArr = Object.keys(colours);
      // store the colours as a string
      var colorShort = "";
      // get each colour, color short ends up as "blue, black, and red"
      for (var i = 0, n = objectKeysArr.length; i < n; i++) {
        // current key is the colour
        var currentKey = objectKeysArr[i];
        // don't display generic
        if (currentKey != "generic"){
          colorShort += " " + currentKey;
          if (i != n-2 && i != n-1)
            colorShort += ","
          //if second to last
          if (i == n-2)
            colorShort += " and";
          }
      }
      // string becomes "As this card costs blue, black and red mana, it is blue, black, and red."
      return "As this card costs" + colorShort + " mana, it is" + colorShort + ".";
    }
  }



}

// get a randomCard from the list
function newRandomCard() {
  var nowCard = getRandomCard(cardList);
  displayCurrentCard(nowCard);
  displayTextFromCard(nowCard);
}

// count variable to make the function display at the end
var count = 0;

function recursiveAddThenDisplay(url) {
  count++;
  $.getJSON(url, function(list) {
    cardList.push(list.data);
    if (list.has_more) {
      recursiveAddThenDisplay(list.next_page);
    }
    count--;
    if (count === 0) {
      newRandomCard();
    }
  });
}


var standardCreatures = "https://api.scryfall.com/cards/search?q=format%3Astandard+t%3Acreature";
// function to fetch all standard cards and initialise
function getListAndInitialise(url) {
  // make a JSON call
  recursiveAddThenDisplay(standardCreatures, function() {
  });
}
