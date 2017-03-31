$(document).ready(function() {
  displayCurrentCard(currentCard);
  displayDefaultText(currentCard);
  getListAndInitialise();
  addClickListeners();
});

// store the data from the JSON request in a variable
var cardList = [];

// TODO have a starting currentCard: cloudblazer;
// have a variable to store the current card, for random card etc.
var currentCard = {
  "image_uri": "https://img.scryfall.com/cards/en/kld/176.jpg?20170330011327",
  "name": "Cloudblazer",
  "mana_cost": "{3}{W}{U}",
  "converted_mana_cost": "5.0",
  "type_line": "Creature — Human Scout",
  "oracle_text": "Flying\nWhen Cloudblazer enters the battlefield, you gain 2 life and draw two cards.",
  "power": "2",
  "toughness": "2",
  "colors": [
    "W",
    "U"
  ],
  "color_identity": [
    "W",
    "U"
  ],
  "set_name": "Kaladesh",
  "rarity": "uncommon",
  "flavor_text": "All the aether charts in the world can't compete with the trained eye of a talented scout.",
  "artist": "Dan Scott",
  };

// recursive function to add cards to the list, used when pulling the data
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
  var image = document.getElementById("card-img");
  var imageLink = "<img src='" + card.image_uri + "' id='card-img'>";
  // replace the current image with the new one
  image.outerHTML = imageLink;
}

// clears text
function clearExplanation() {
  document.getElementById("card-exp").innerHTML("");
}

// default section
function displayDefaultText(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = card.name;
  document.getElementById("title-text").innerHTML = cardName;
  cardExp.innerHTML = "<div class='center'><h1>" + cardName + "</h1></div><p>Click on different parts of the card to learn more!</p>";
}

//displayname section
function displayNameFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = card.name;
  document.getElementById("title-text").innerHTML = cardName; 
  cardExp.innerHTML = "<div class='center'><h2>" + cardName + "</h2></div><p>This is the card's name. Pretty cool, eh?</p>";
}

// TODO FIX X casting costs cards
// manacost section
function displayManaFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = card.name;
  // colours object to store for both functions
  var colours = {};
  var hasColouredManaCost = false;

  // get a mana cost string
  var manaCostString = makeManaCostString(card.mana_cost);
  var colourIdentityString = makeColourIdenString();

  // make a mana cost section
  var manaCostBlock = "<div class='center'><h2>Mana Cost and Colours</h2></div><p>In general, an amount of mana must be paid to cast a spell. (Creatures count as spells while you are summoning them.) " + cardName + "\'s mana cost is in its upper right hand corner. " + manaCostString + " and its converted (total) mana cost is " + parseInt(card.converted_mana_cost) + ".</p>";

  // make the colour section
  var colourBlock = "<p>A card\'s colours is usually determined by its casting cost. " + colourIdentityString + "</p>";

  cardExp.innerHTML = manaCostBlock + colourBlock;

  // this function returns the mana cost of the card in continuous text.
  // e.g. "cardName costs 2 generic mana and 2 black mana"
  // the string fed in is the mana cost
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
    var manacostString = cardName + " costs";
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

  // this function returns a string about the colours of the card
  // "As this card costs red, green and blue mana, it is red, green and blue."
  function makeColourIdenString() {
    // colorless
    if (card.colors.length == 0 && !hasColouredManaCost) {
      return "This card is colourless."
    }
    // colorless despite coloured?
    if (card.colors.length == 0 && hasColouredManaCost) {
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

// type line section
function displayTypeFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = card.name;
  var creatureType = card.type_line;
  // default text
  var text = "<p>Creatures usually have a creature type, and this is located below the art. There are cards that care about certain types and often grant bonuses and beneficial effects, so look out for them!</p>"
  // if legendary
  if (creatureType.search("Legendary") != -1) {
    text += "<p>When a creature card refers to a named figure from the story or multiverse, it is often given the supertype \'Legendary\'. You may only have one legendary card with the same name on the battlefield at once. If, somehow, you end up with more than one, you choose one and the rest go to your graveyard.</p>"
  }
  // if artifact
  if (creatureType.search("Artifact") != -1) {
    text += "<p>This card is an artifact! Artifact creatures often represent animated constructs and are normally colourless.</p>"
  }
  cardExp.innerHTML = "<h2><em>" + cardName + "</em> is a " + creatureType + "</h2>" + text;
  // TODO add "an" when it is an artifact
}

// make SET and RARITY
function displaySetFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var rarityColour;
  // this switch case updates rarity colour
  switch (card.rarity) {
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
  cardExp.innerHTML =  "<div class='center'><h2>Set and Rarity</h2></div><p>On the far right of the creature type line, there is a set symbol that indicates the card\'s rarity and what set it comes from. " + card.name + " is from the <em>" + card.set_name + "</em> set and is " + card.rarity + ", as indicated by the " + rarityColour + " colour of the symbol.</p>";
}

// textbox section
// TODO fill in abilities etc.
// make ABILITIES seection
function displayAbilitiesFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var oracleText = card.oracle_text;
  var cardName = card.name;
  var text = "<div class='center'><h2>Abilities</h2></div><p>Creatures often have special abilities. These are located in the card\'s text box, below the card\'s creature type and are often defined in full. The game has a hefty comprehensive rulebook, available <a href=\"http://magic.wizards.com/en/game-info/gameplay/rules-and-formats/rules\">here</a>.</p>"
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
  cardExp.innerHTML = text;
}

// make POWER and TOUGHNESS section
function displayPTFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = card.name;
  cardExp.innerHTML = "<div class='center'><h2>Power and Toughness</h2></div><p>Creatures are used to attack your opponents and block your opponents\' creatures when they attack you. This is where their power and toughness attributes come in. These are located in the lower right corner.</p><p>" + cardName + " has " + card.power + " power and " + card.toughness + " toughness. It is a " + card.power + "/" + card.toughness + ".";
}

// TODO artist
function displayArtistFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  cardExp.innerHTML = "<p>" + card.artist + " did the art for " + card.name + ". Pretty incredible, don't you think? The art is one of my favourite things about the game.</p>"
}

// get a randomCard from the list
function newRandomCard() {
  currentCard = getRandomCard(cardList);
  displayCurrentCard(currentCard);
  displayDefaultText(currentCard);
}


// count variable to make the function display at the end
// var count = 0;
function recursiveAddThenDisplay(url) {
  // count++;
  $.getJSON(url, function(list) {
    cardList.push(list.data);
    if (list.has_more) {
      recursiveAddThenDisplay(list.next_page);
    }
    // count--;
    // if (count === 0) {
    //   newRandomCard();
    // }
  });
}


var standardCreatures = "https://api.scryfall.com/cards/search?q=format%3Astandard+t%3Acreature";
// function to fetch all standard cards and initialise
function getListAndInitialise(url) {
  // make a JSON call
  recursiveAddThenDisplay(standardCreatures, function() {
  });
}


function addClickListeners() {
  var cardContainer = document.getElementById("card-container");
  cardContainer.addEventListener('click', function(event) {
    var clickedId = event.target.id;
    //  if name, display name
    if (clickedId == "name-overlay")
      displayNameFromCard(currentCard);
    //  if mana cost, display mana_cost
    if (clickedId == "mana-overlay")
      displayManaFromCard(currentCard);
    //  if creature type, display creature type
    if (clickedId == "type-overlay")
      displayTypeFromCard(currentCard);
    //  if set symbol, display set symbol
    if (clickedId == "set-symbol-overlay")
      displaySetFromCard(currentCard);
    // if text box, display text box
    if (clickedId == "text-box-overlay")
      displayAbilitiesFromCard(currentCard);
    // if power/toughness, display power/toughness
    if (clickedId == "power-toughness-overlay")
      displayPTFromCard(currentCard);
    // if artist, display artist
    if (clickedId == "artist-overlay")
      displayArtistFromCard(currentCard);
  });
}
