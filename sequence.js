myHand = [];
addTokenMode = false;
addTokenColor = "";

showTotalWorth = true;
showColorWorth = false;
showOnlyHand = false;

$(document).ready(function(){

    renderBoard();
    renderCardList();

    $("#showTotalWorth").prop('checked', showTotalWorth);
    $("#showColorWorth").prop('checked', showColorWorth);
    $("#showOnlyHand").prop('checked', showOnlyHand);

    $("#showTotalWorth").change(function() {
        showTotalWorth = $("#showTotalWorth").is(':checked');
        renderBoard();
    });
    $("#showColorWorth").change(function() {
        showColorWorth = $("#showColorWorth").is(':checked');
        renderBoard();
    });
    $("#showOnlyHand").change(function() {
        showOnlyHand = $("#showOnlyHand").is(':checked');
        renderBoard();
    });

});


renderBoard = function() {
    for (var y = 0; y < gameBoard.length; y++) {
        var row = gameBoard[y];
        for (var x = 0; x < row.length; x++) {
            var cell = row[x];
            cell.redWorth = calculateSquareWorth(x, y, "R");
            cell.blueWorth = calculateSquareWorth(x, y, "B");
            cell.totalWorth = cell.redWorth + cell.blueWorth;
        }
    }

    var gameBoardTemplate = Handlebars.compile($("#gameBoard").html());
    var gameBoardContext = {
        rows: gameBoard,
        hand: myHand,
        addTokenMode: addTokenMode,
        showTotalWorth: showTotalWorth,
        showColorWorth: showColorWorth,
        showOnlyHand: showOnlyHand
    };
    $("#gameBoardDiv").html(gameBoardTemplate(gameBoardContext));

    $('.hand-card').click(function() {
        var cardValue = $(this).html();
        myHand = _.without(myHand, cardValue);

        //remove highlights from game board
        if (!_.contains(["JS", "JC", "JH", "JD"], cardValue)) {
            var card = _.findWhere(cardDeck, {value: cardValue});
            var loc1 = card.locations[0];
            var loc2 = card.locations[1];
            gameBoard[loc1.y][loc1.x].highlight = "";
            gameBoard[loc2.y][loc2.x].highlight = "";
        }

        renderBoard();
    });

    $('.game-cell').click(function() {
        if (addTokenMode) {
            var y = this.parentNode.rowIndex;
            var x = this.cellIndex;

            if (gameBoard[y][x].token === "") {
                placeToken(x, y, addTokenColor);
            }
            else if (gameBoard[y][x].token === addTokenColor || _.contains(myHand, "JS") || _.contains(myHand, "JH")) {
                clearToken(x, y);
            }
        }
    });

    $('#addRedToken').click(function() {
        addTokenMode = true;
        addTokenColor = "R";
        renderBoard();
    });
    $('#addBlueToken').click(function() {
        addTokenMode = true;
        addTokenColor = "B";
        renderBoard();
    });
    $('#cancelAddToken').click(function() {
        addTokenMode = false;
        addTokenColor = "";
        renderBoard();
    });
};

calculateSquareWorth = function(x, y, color) {
    var worth = 10;
    if (gameBoard[y][x].token !== "") {
        return 0;
    }

    worth += calculateWorthForDirection(x, y, color, "vertical");
    worth += calculateWorthForDirection(x, y, color, "horizontal");
    worth += calculateWorthForDirection(x, y, color, "diagonalA");
    worth += calculateWorthForDirection(x, y, color, "diagonalB");

    return worth;
};

getXYAfterIncrementForDirection = function(x, y, increment, direction) {
    if (direction === "horizontal") {
        return {x: (x + increment), y: y };
    }
    else if (direction === "vertical") {
        return {x: x , y: (y + increment) };
    }
    else if (direction === "diagonalA") {
        return {x: (x + increment), y: (y + increment) };
    }
    else if (direction === "diagonalB") {
        return {x: (x + increment) , y: (y - increment) };
    }
};

calculateWorthForDirection = function(x, y, color, direction) {
    // to calculate our worth we first need to detect our borders to determine if we have room to complete a new set
    var positiveBorder = 1;
    var myTokensInARow = 0;
    var beginningOfCompletedSet = 1;
    // loop until we hit another color token, the board edge or detect a completed set
    var loc = getXYAfterIncrementForDirection(x, y, positiveBorder, direction);
    while (!safeCheckOpponentValue(loc.x, loc.y, color) && myTokensInARow < 5) {
        if (safeCheckMyValue(loc.x, loc.y, color)) {
            if (myTokensInARow === 0) beginningOfCompletedSet = positiveBorder;
            myTokensInARow++;
        } else {
            myTokensInARow = 0;
        }
        positiveBorder++;
        loc = getXYAfterIncrementForDirection(x, y, positiveBorder, direction);
    }
    // if we found a completed set the border is the beginning of that set
    if (myTokensInARow >= 5) positiveBorder = beginningOfCompletedSet;
    if (positiveBorder > 5) positiveBorder = 5;

    // do the same calculation to detect our border in the other direction
    var negativeBorder = 1;
    myTokensInARow = 0;
    beginningOfCompletedSet = 1;
    // loop until we hit another color token, the board edge or detect a completed set
    loc = getXYAfterIncrementForDirection(x, y, -negativeBorder, direction);
    while (!safeCheckOpponentValue(loc.x, loc.y, color) && myTokensInARow < 5) {
        if (safeCheckMyValue(loc.x, loc.y, color)) {
            if (myTokensInARow === 0) beginningOfCompletedSet = negativeBorder;
            myTokensInARow++;
        } else {
            myTokensInARow = 0;
        }
        negativeBorder++;
        loc = getXYAfterIncrementForDirection(x, y, -negativeBorder, direction);
    }
    if (myTokensInARow >= 5) negativeBorder = beginningOfCompletedSet;
    if (negativeBorder > 5) negativeBorder = 5;


    // We are blocked if we can't fit 5 tokens in a row, since we start our border indexes at 1 we're checking < 6
    var blocked = ((positiveBorder + negativeBorder) < 6)
    if (blocked) {
        return 0;
    }


    // Grant a large bonus if this will complete a set
    var inARowPositive = 0;
    loc = getXYAfterIncrementForDirection(x, y, inARowPositive+1, direction);
    while (safeCheckMyValue(loc.x, loc.y, color) && inARowPositive < positiveBorder) {
        inARowPositive++;
        loc = getXYAfterIncrementForDirection(x, y, inARowPositive+1, direction);
    }

    var inARowNegative = 0;
    loc = getXYAfterIncrementForDirection(x, y, -(inARowNegative+1), direction);
    while (safeCheckMyValue(loc.x, loc.y, color) && inARowNegative < negativeBorder) {
        inARowNegative++;
        loc = getXYAfterIncrementForDirection(x, y, -(inARowNegative+1), direction);
    }

    if ((inARowPositive + inARowNegative) >= 4) return 500;


    // Otherwise calculate worth based on how close we can get to completing a set
    // worth increases for every friendly token within our borders because the more tokens, the closer we are to a set
    var worth_PositiveDirection = 0;
    var iter = 1;
    // as odd as it sounds, if the cell on our border and the cell just beyond our border are both ours we aren't adding any value
    loc = getXYAfterIncrementForDirection(x, y, positiveBorder-1, direction);
    var locB = getXYAfterIncrementForDirection(x, y, positiveBorder, direction);
    if (!(safeCheckMyValue(loc.x, loc.y, color) && safeCheckMyValue(locB.x, locB.y, color))) {
        while (iter < positiveBorder) {
            // if the current color is ours add worth
            loc = getXYAfterIncrementForDirection(x, y, iter, direction);
            if (safeCheckMyValue(loc.x, loc.y, color)) worth_PositiveDirection += 10;
            iter++;
        }
    }
    // make the same calculation in the other direction
    var worth_NegativeDirection = 0;
    iter = 1;
    loc = getXYAfterIncrementForDirection(x, y, -(negativeBorder-1), direction);
    locB = getXYAfterIncrementForDirection(x, y, -negativeBorder, direction);
    if (!(safeCheckMyValue(loc.x, loc.y, color) && safeCheckMyValue(locB.x, locB.y, color))) {
        while (iter < negativeBorder) {
            loc = getXYAfterIncrementForDirection(x, y, -iter, direction);
            if (safeCheckMyValue(loc.x, loc.y, color)) worth_NegativeDirection += 10;
            iter++;
        }
    }

    return worth_PositiveDirection + worth_NegativeDirection;
};

safeCheckMyValue = function(x, y, myColor) {
    if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
        var cell = gameBoard[y][x];
        return (gameBoard[y][x].token === myColor || gameBoard[y][x].token === "W");
    }
    return false;
};

safeCheckOpponentValue = function(x, y, myColor) {
    var opponentAColor = "B";
    var opponentBColor = "G";
    if (myColor === "B") opponentAColor = "R";
    if (myColor === "G") opponentBColor = "R";

    if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
        var cell = gameBoard[y][x];
        return (gameBoard[y][x].token === opponentAColor || gameBoard[y][x].token === opponentBColor);
    }
    return true;
};

renderCardList = function() {
    var heartCards = _.where(cardDeck, {suit: "H"});
    var diamondCards = _.where(cardDeck, {suit: "D"});
    var clubCards = _.where(cardDeck, {suit: "C"});
    var spadeCards = _.where(cardDeck, {suit: "S"});

    var cardListTemplate = Handlebars.compile($("#cardList").html());
    var cardListContext = {
        hearts: heartCards,
        diamonds: diamondCards,
        clubs: clubCards,
        spades: spadeCards
    };
    $("#cardListDiv").html(cardListTemplate(cardListContext));

    $('.select-card').click(function(e) {
        var cardValue = $(this).html();
        if (_.contains(myHand, cardValue))
            return false;

        myHand.push(cardValue);

        if (!_.contains(["JS", "JC", "JH", "JD"], cardValue)) {
            //highlight the card's locations on the board
            var card = _.findWhere(cardDeck, {value: cardValue});
            var loc1 = card.locations[0];
            var loc2 = card.locations[1];
            gameBoard[loc1.y][loc1.x].highlight = "highlight";
            gameBoard[loc2.y][loc2.x].highlight = "highlight";
        }

        renderBoard();
    });
};

placeToken = function(x, y, color) {
    if (_.contains(["R","B","G"], color) && gameBoard[y][x].token === "") {
        gameBoard[y][x].token = color;
    }
    renderBoard();
};
clearToken = function(x, y) {
    gameBoard[y][x].token = "";
    renderBoard();
};


Handlebars.registerHelper("showWorth", function(showOnlyHand, highlight) {
    return !showOnlyHand || highlight;
});

Handlebars.registerHelper("showHighlight", function(token, highlight) {
    if (token === "" && highlight || _.contains(myHand, "JD") || _.contains(myHand, "JC")) {
        return "highlight";
    }
    return "";
});

Handlebars.registerHelper("showRemoveToken", function(token) {
    return token !== "W" && (_.contains(myHand, "JS") || _.contains(myHand, "JH"));
});


cardDeck = [
    { value: "2S", suit: "S", locations:[{y:0, x:1}, {y:8, x:6}]},
    { value: "3S", suit: "S", locations:[{y:0, x:2}, {y:8, x:5}]},
    { value: "4S", suit: "S", locations:[{y:0, x:3}, {y:8, x:4}]},
    { value: "5S", suit: "S", locations:[{y:0, x:4}, {y:8, x:3}]},
    { value: "6S", suit: "S", locations:[{y:0, x:5}, {y:8, x:2}]},
    { value: "7S", suit: "S", locations:[{y:0, x:6}, {y:8, x:1}]},
    { value: "8S", suit: "S", locations:[{y:0, x:7}, {y:7, x:1}]},
    { value: "9S", suit: "S", locations:[{y:0, x:8}, {y:6, x:1}]},
    { value: "TS", suit: "S", locations:[{y:1, x:9}, {y:5, x:1}]},
    { value: "JS", suit: "S", locations:[]},
    { value: "QS", suit: "S", locations:[{y:2, x:9}, {y:4, x:1}]},
    { value: "KS", suit: "S", locations:[{y:3, x:9}, {y:3, x:1}]},
    { value: "AS", suit: "S", locations:[{y:4, x:9}, {y:2, x:1}]},

    { value: "2C", suit: "C", locations:[{y:1, x:4}, {y:3, x:6}]},
    { value: "3C", suit: "C", locations:[{y:1, x:3}, {y:3, x:5}]},
    { value: "4C", suit: "C", locations:[{y:1, x:2}, {y:3, x:4}]},
    { value: "5C", suit: "C", locations:[{y:1, x:1}, {y:3, x:3}]},
    { value: "6C", suit: "C", locations:[{y:1, x:0}, {y:3, x:2}]},
    { value: "7C", suit: "C", locations:[{y:2, x:0}, {y:4, x:2}]},
    { value: "8C", suit: "C", locations:[{y:3, x:0}, {y:5, x:2}]},
    { value: "9C", suit: "C", locations:[{y:4, x:0}, {y:6, x:2}]},
    { value: "TC", suit: "C", locations:[{y:5, x:0}, {y:7, x:2}]},
    { value: "JC", suit: "C", locations:[]},
    { value: "QC", suit: "C", locations:[{y:6, x:0}, {y:7, x:3}]},
    { value: "KC", suit: "C", locations:[{y:7, x:0}, {y:7, x:4}]},
    { value: "AC", suit: "C", locations:[{y:8, x:0}, {y:7, x:5}]},

    { value: "2D", suit: "D", locations:[{y:2, x:2}, {y:5, x:9}]},
    { value: "3D", suit: "D", locations:[{y:2, x:3}, {y:6, x:9}]},
    { value: "4D", suit: "D", locations:[{y:2, x:4}, {y:7, x:9}]},
    { value: "5D", suit: "D", locations:[{y:2, x:5}, {y:8, x:9}]},
    { value: "6D", suit: "D", locations:[{y:2, x:6}, {y:9, x:8}]},
    { value: "7D", suit: "D", locations:[{y:2, x:7}, {y:9, x:7}]},
    { value: "8D", suit: "D", locations:[{y:3, x:7}, {y:9, x:6}]},
    { value: "9D", suit: "D", locations:[{y:4, x:7}, {y:9, x:5}]},
    { value: "TD", suit: "D", locations:[{y:5, x:7}, {y:9, x:4}]},
    { value: "JD", suit: "D", locations:[]},
    { value: "QD", suit: "D", locations:[{y:6, x:7}, {y:9, x:3}]},
    { value: "KD", suit: "D", locations:[{y:7, x:7}, {y:9, x:2}]},
    { value: "AD", suit: "D", locations:[{y:7, x:6}, {y:9, x:1}]},

    { value: "2H", suit: "H", locations:[{y:5, x:4}, {y:8, x:7}]},
    { value: "3H", suit: "H", locations:[{y:5, x:5}, {y:8, x:8}]},
    { value: "4H", suit: "H", locations:[{y:4, x:5}, {y:7, x:8}]},
    { value: "5H", suit: "H", locations:[{y:4, x:4}, {y:6, x:8}]},
    { value: "6H", suit: "H", locations:[{y:4, x:3}, {y:5, x:8}]},
    { value: "7H", suit: "H", locations:[{y:5, x:3}, {y:4, x:8}]},
    { value: "8H", suit: "H", locations:[{y:6, x:3}, {y:3, x:8}]},
    { value: "9H", suit: "H", locations:[{y:6, x:4}, {y:2, x:8}]},
    { value: "TH", suit: "H", locations:[{y:6, x:5}, {y:1, x:8}]},
    { value: "JH", suit: "H", locations:[]},
    { value: "QH", suit: "H", locations:[{y:6, x:6}, {y:1, x:7}]},
    { value: "KH", suit: "H", locations:[{y:5, x:6}, {y:1, x:6}]},
    { value: "AH", suit: "H", locations:[{y:4, x:6}, {y:1, x:5}]}
];

gameBoard = [
    [
        {value: "W", token: "W"},
        {value: "2S", token: ""},
        {value: "3S", token: ""},
        {value: "4S", token: ""},
        {value: "5S", token: ""},
        {value: "6S", token: ""},
        {value: "7S", token: ""},
        {value: "8S", token: ""},
        {value: "9S", token: ""},
        {value: "W", token: "W"}
    ],
    [
        {value: "6C", token: ""},
        {value: "5C", token: ""},
        {value: "4C", token: ""},
        {value: "3C", token: ""},
        {value: "2C", token: ""},
        {value: "AH", token: ""},
        {value: "KH", token: ""},
        {value: "QH", token: ""},
        {value: "TH", token: ""},
        {value: "TS", token: ""}
    ],
    [
        {value: "7C", token: ""},
        {value: "AS", token: ""},
        {value: "2D", token: ""},
        {value: "3D", token: ""},
        {value: "4D", token: ""},
        {value: "5D", token: ""},
        {value: "6D", token: ""},
        {value: "7D", token: ""},
        {value: "9H", token: ""},
        {value: "QS", token: ""}
    ],
    [
        {value: "8C", token: ""},
        {value: "KS", token: ""},
        {value: "6C", token: ""},
        {value: "5C", token: ""},
        {value: "4C", token: ""},
        {value: "3C", token: ""},
        {value: "2C", token: ""},
        {value: "8D", token: ""},
        {value: "8H", token: ""},
        {value: "KS", token: ""}
    ],
    [
        {value: "9C", token: ""},
        {value: "QS", token: ""},
        {value: "7C", token: ""},
        {value: "6H", token: ""},
        {value: "5H", token: ""},
        {value: "4H", token: ""},
        {value: "AH", token: ""},
        {value: "9D", token: ""},
        {value: "7H", token: ""},
        {value: "AS", token: ""}
    ],
    [
        {value: "TC", token: ""},
        {value: "TS", token: ""},
        {value: "8C", token: ""},
        {value: "7H", token: ""},
        {value: "2H", token: ""},
        {value: "3H", token: ""},
        {value: "KH", token: ""},
        {value: "TD", token: ""},
        {value: "6H", token: ""},
        {value: "2D", token: ""}
    ],
    [
        {value: "QC", token: ""},
        {value: "9S", token: ""},
        {value: "9C", token: ""},
        {value: "8H", token: ""},
        {value: "9H", token: ""},
        {value: "TH", token: ""},
        {value: "QH", token: ""},
        {value: "QD", token: ""},
        {value: "5H", token: ""},
        {value: "3D", token: ""}
    ],
    [
        {value: "KC", token: ""},
        {value: "8S", token: ""},
        {value: "TC", token: ""},
        {value: "QC", token: ""},
        {value: "KC", token: ""},
        {value: "AC", token: ""},
        {value: "AD", token: ""},
        {value: "KD", token: ""},
        {value: "4H", token: ""},
        {value: "4D", token: ""}
    ],
    [
        {value: "AC", token: ""},
        {value: "7S", token: ""},
        {value: "6S", token: ""},
        {value: "5S", token: ""},
        {value: "4S", token: ""},
        {value: "3S", token: ""},
        {value: "2S", token: ""},
        {value: "2H", token: ""},
        {value: "3H", token: ""},
        {value: "5D", token: ""}
    ],
    [
        {value: "W", token: "W"},
        {value: "AD", token: ""},
        {value: "KD", token: ""},
        {value: "QD", token: ""},
        {value: "TD", token: ""},
        {value: "9D", token: ""},
        {value: "8D", token: ""},
        {value: "7D", token: ""},
        {value: "6D", token: ""},
        {value: "W", token: "W"}
    ]
];