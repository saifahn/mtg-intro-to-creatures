$(document).ready(function() {
  displayCurrentCard(currentCard);
  displayDefaultText(currentCard);
  getListAndInitialise();
  addClickListeners();
});

// store the data from the JSON request in a variable
var cardList = [];
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
  "layout": "normal",
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
// function to display the current card image
function displayCurrentCard(card) {
  var image = document.getElementById("card-img");
  var imageLink = "<img src='" + card.image_uri + "' id='card-img'>";
  // replace the current image with the new one
  image.outerHTML = imageLink;
}
// default section
function displayDefaultText(card) {
  var cardName = card.name;
  document.getElementById("title-text").innerHTML = cardName;
  document.getElementById("card-exp").innerHTML = "<p>Click on different parts of the card to learn more about the game and the <span class='jargon'>multiverse</span>!</p>";
}
//displayname section
function displayNameFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = card.name;
  document.getElementById("title-text").innerHTML = cardName;
  cardExp.innerHTML = "<p>This is the card's name. What do you think? Would you be happy if you had been given this name?</p>";
}
// TODO FIX X casting costs cards
// manacost section
function displayManaFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = "<em>" + card.name +"</em>";
  // colours object to store for both functions
  var colours = {};
  var hasColouredManaCost = false;

  // get a mana cost string
  var manaCostString = makeManaCostString(card.mana_cost);
  var colourIdentityString = makeColourIdenString();

  // make a mana cost section
  var manaCostBlock = "<div class='center'><h2>Mana Cost and Colours</h2></div><p>To summon creatures to do your bidding, you need to pay <span class='jargon'>mana</span>. This is " + cardName + "\'s <span class='jargon'>mana cost</span>; " + manaCostString + " and its <span class='jargon'>converted mana cost</span> (total) is " + parseInt(card.converted_mana_cost) + ".</p>";

  // make the colour section
  var colourBlock = "<p>A card\'s colours is usually determined by its casting cost. " + colourIdentityString + "</p>";

  cardExp.innerHTML = manaCostBlock + colourBlock;

  // this function returns the mana cost of the card in continuous text.
  // e.g. "It costs 2 generic mana and 2 black mana"
  // the string fed in is the mana cost
  function makeManaCostString(string) {
    // if no mana cost
    if (!string)
      return "Unusually, this card has no <span class='jargon'>mana cost</span>. It's probably special."
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
    var manacostString = "it costs";
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
    return "As " + cardName + " costs" + colorShort + " mana, it is" + colorShort + ".";
  }
}

// type line section
function displayTypeFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = "<em>" + card.name + "</em>";
  var creatureType = card.type_line.match(/—\s(.+)/)[1];
  // if creature starts with aeiou
  var vowelStart = false;
  if (creatureType.search(/AEIOU/) == 0)
    vowelStart = true;

  var text = "<div class='center'><h2>" + cardName + " is a";
  // if vowel start
  if (vowelStart)
    text += "n";
  //add a space
  text +=  " " + creatureType + "</h2></div>"
  // default text
  text += "<p>This is the card's <span class='jargon'>creature type</span>. There are cards that care about certain types and often grant bonuses and beneficial effects, so look out for them!</p>"
  // if legendary
  if (creatureType.search("Legendary") != -1) {
    text += "<p>" + cardName + " is  <span class='jargon'>\'Legendary\'</span>! He/she/it is a named character from Magic's <span class='jargon'>multiverse</span> and is extra special; you can't have another creature with the same name on the <span class='jargon'>battlefield</span> at the same time.</p>"
  }
  // if artifact
  if (creatureType.search("Artifact") != -1) {
    text += "<p>This card is an <span class='jargon'>artifact</span>. Artifact creatures often represent animated constructs and are normally colourless.</p>"
  }
  cardExp.innerHTML = text;
}

// make SET and RARITY
function displaySetFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = "<em>" + card.name + "</em>";
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
  cardExp.innerHTML =  "<div class='center'><h2>Set and Rarity</h2></div><p>This <span class='jargon'>set symbol</span> indicates the card\'s rarity and what <span class='jargon'>set</span> it comes from. " + cardName + " is from the <em>" + card.set_name + "</em> set and is <span class='jargon'>" + card.rarity + "</span>, as indicated by the " + rarityColour + " colour of the symbol.</p>";
}

// textbox section
// TODO fill in abilities etc.
// make ABILITIES seection
function displayAbilitiesFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var oracleText = card.oracle_text;
  var cardName = "<em>" + card.name + "</em>";
  var text = "<div class='center'><h2>Abilities</h2></div><p>Creatures often have special abilities to help you vanquish your opponents.</p>"
  // match a bunch of different matches for abilities
  // TODO
  // get rid of the card name from the box, gets rid of stuff like "flying men"
  var replacedText = oracleText.replace(card.name, "");
  replacedText = replacedText.toLowerCase();
  // deathtouch
  if (replacedText.match("deathtouch")) {
    text += "<p>If a creature is dealt damage by a creature with <span class='jargon'>deathtouch</span>, it is destroyed, even if it was only 1 damage. Kinda terrifying.</p>"
  }
  // defender
  if (replacedText.match("defender")) {
    text += "<p>Creatures with <span class='jargon'>defender</span> are made for blocking. They can't attack, even if they wanted to.</p>"
  }
  // flash
  if (replacedText.match("flash")) {
    text += "<p>Cards with <span class='jargon'>flash</span> can be played almost any time, even during your opponents' turns. Who doesn't like using the element of surprise?</p>"
  }
  // reach, get rid of flying if it's there
  if (replacedText.match("reach")) {
    text += "<p>" + cardName + " has <span class='jargon'>reach</span>, so it can block those pesky fliers your opponent has.</p>";
    replacedText.replace("flying", "");
  }
  // flying
  if (replacedText.match("flying")) {
    text += "<p>This creature has <span class='jargon'>flying</span> - it can only be blocked by other creatures with flying. This means you can often attack your opponent directly and who doesn't want to do that?</p>"
  }
  // haste
  if (replacedText.match("haste")) {
    text += "<p>Creatures without <span class='jargon'>haste</span> have to wait a turn before they can attack or <span class='jargon'>\'tap\'</span>. However, creatures like " + cardName + " can attack the turn they are summoned. Good for impatient people like me.</p>"
  }
  // lifelink
  if (replacedText.match("lifelink")) {
    text += "<p>" + cardName + " has <span class='jargon'>lifelink</span>, which means that you gain life equal to the damage it deals. That makes it less likely that you die, which I'm pretty sure is a bonus.</p>"
  }
  // menace
  if (replacedText.match("menace")) {
    text += "<p>Creatures like " + cardName + " are so <span class='jargon'>menace</span>-ing that they can only be blocked if two or more creatures get the courage to block it at the same time. Me? I wouldn't dare.</p>"
  }
  // TODO tap symbol {T}
  // if (replacedText.match("{t}")) {
  //   var tapSymbol = "<img alt='T.svg' src='assets/img/T.svg' width='30px' height='30px' class='inline-image'>";
  //   text += "<p>" + tapSymbol + " is the <span class='jargon'>\'tap\'</span> symbol.</p>"
  // }
  // trample
  if (replacedText.match("trample")) {
    text += "<p>Creatures with <span class='jargon'>trample</span> deal their excess damage to the <span class='jargon'>defending player</span> when they're blocked. It's best on huge, beefy creatures.</p>"
  }
  // vigilance
  if (replacedText.match("vigilance")) {
    text += "<p>Normally, creatures must <span class='jargon'>\'tap\'</span>, or be turned 90 degrees, to attack. If a creature has <span class='jargon'>vigilance</span> (like this one), however, attacking doesn't cause it to tap. This is useful as only <span class='jargon'>\'untapped\'</span> creatures are able to block.</p>"
  }
  // add the rulebook bit
  text += "<p>The game has a hefty comprehensive rulebook (over 200 pages!) that explains all the rules and abilities, available <a href=\"http://magic.wizards.com/en/game-info/gameplay/rules-and-formats/rules\" target=blank>here</a>.</p>";
  cardExp.innerHTML = text;
}

// make POWER and TOUGHNESS section
function displayPTFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  var cardName = "<em>" + card.name + "</em>";
  cardExp.innerHTML = "<div class='center'><h2>Power and Toughness</h2></div><p>These are " + cardName + "'s <span class='jargon'>power</span> and <span class='jargon'>toughness</span> attributes. These are important for when you send it to fight your opponents and their creatures!</p><p>" + cardName + " has " + card.power + " power and " + card.toughness + " toughness.</p>";
}

// TODO artist
function displayArtistFromCard(card) {
  var cardExp = document.getElementById("card-exp");
  cardExp.innerHTML = "<p>" + card.artist + " did the art for <em>" + card.name + "</em>. Pretty cool, isn't it? The art is one of my favourite things about the game.</p>"
}

// get a randomCard from the list
function newRandomCard() {
  currentCard = getRandomCard(cardList);
  // ignore transform card for now
  while (currentCard.layout == "transform") {
    currentCard = getRandomCard(cardList);
  }
  displayCurrentCard(currentCard);
  displayDefaultText(currentCard);
}


// recursive function to add all the data to the list
function recursiveAddThenDisplay(url) {
  $.getJSON(url, function(list) {
    cardList.push(list.data);
    if (list.has_more) {
      recursiveAddThenDisplay(list.next_page);
    }
  });
}

var standardCreatures = "https://api.scryfall.com/cards/search?q=format%3Astandard+t%3Acreature";
// function to fetch all the recent creature cards and initialise
function getListAndInitialise(url) {
  // make a JSON call
  recursiveAddThenDisplay(standardCreatures, function() {
  });
}

// for the click-ability on the image
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
