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
    for (var x = 0; x < gameBoard.length; x++) {
        var row = gameBoard[x];
        for (var y = 0; y < row.cells.length; y++) {
            var cell = row.cells[y];
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
            gameBoard[loc1.x].cells[loc1.y].highlight = "";
            gameBoard[loc2.x].cells[loc2.y].highlight = "";
        }

        renderBoard();
    });

    $('.game-cell').click(function() {
        if (addTokenMode) {
            var x = this.parentNode.rowIndex;
            var y = this.cellIndex;

            if (gameBoard[x].cells[y].token === "") {
                placeToken(x, y, addTokenColor);
            }
            else if (gameBoard[x].cells[y].token === addTokenColor || _.contains(myHand, "JS") || _.contains(myHand, "JH")) {
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
    if (gameBoard[x].cells[y].token !== "") {
        return 0;
    }

    //vertical
    worth += calculateVertical(x, y, color);

    //horizontal
    worth += calculateHorizontal(x, y, color);

    //diagonalA
    worth += calculateDiagonalA(x, y, color);

    //diagonalB
    worth += calculateDiagonalB(x, y, color);

    return worth;
};

calculateVertical = function(x, y, color) {
    var worth = 0;

    var max = 1;
    while (!safeCheckOpponentValue(x+max, y, color) && max < 5) { max++; }
    var min = 1;
    while (!safeCheckOpponentValue(x-min, y, color) && min < 5) { min++; }

    var blocked = ((max + min) < 6)
    if (blocked) {
        return 0;
    }

    var iter = 1;
    while (iter < max) {
        if (safeCheckMyValue(x+iter, y, color)) worth += 10;
        iter++;
    }
    iter = 1;
    while (iter < min) {
        if (safeCheckMyValue(x-iter, y, color)) worth += 10;
        iter++;
    }

    if (worth === 40) worth = 500;
    return worth;
};

calculateHorizontal = function(x, y, color) {
    var worth = 0;

    var max = 1;
    while (!safeCheckOpponentValue(x, y+max, color) && max < 5) { max++; }
    var min = 1;
    while (!safeCheckOpponentValue(x, y-min, color) && min < 5) { min++; }

    var blocked = ((max + min) < 6)
    if (blocked) {
        return 0;
    }

    var iter = 1;
    while (iter < max) {
        if (safeCheckMyValue(x, y+iter, color)) worth += 10;
        iter++;
    }
    iter = 1;
    while (iter < min) {
        if (safeCheckMyValue(x, y-iter, color)) worth += 10;
        iter++;
    }

    if (worth === 40) worth = 500;
    return worth;
};

calculateDiagonalA = function(x, y, color) {
    var worth = 0;

    var max = 1;
    while (!safeCheckOpponentValue(x+max, y+max, color) && max < 5) { max++; }
    var min = 1;
    while (!safeCheckOpponentValue(x-min, y-min, color) && min < 5) { min++; }

    var blocked = ((max + min) < 6)
    if (blocked) {
        return 0;
    }

    var iter = 1;
    while (iter < max) {
        if (safeCheckMyValue(x+iter, y+iter, color)) worth += 10;
        iter++;
    }
    iter = 1;
    while (iter < min) {
        if (safeCheckMyValue(x-iter, y-iter, color)) worth += 10;
        iter++;
    }

    if (worth === 40) worth = 500;
    return worth;
};

calculateDiagonalB = function(x, y, color) {
    var worth = 0;

    var max = 1;
    while (!safeCheckOpponentValue(x+max, y-max, color) && max < 5) { max++; }
    var min = 1;
    while (!safeCheckOpponentValue(x-min, y+min, color) && min < 5) { min++; }

    var blocked = ((max + min) < 6)
    if (blocked) {
        return 0;
    }

    var iter = 1;
    while (iter < max) {
        if (safeCheckMyValue(x+iter, y-iter, color)) worth += 10;
        iter++;
    }
    iter = 1;
    while (iter < min) {
        if (safeCheckMyValue(x-iter, y+iter, color)) worth += 10;
        iter++;
    }

    if (worth === 40) worth = 500;
    return worth;
};

safeCheckMyValue = function(x, y, myColor) {
    if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
        var cell = gameBoard[x].cells[y];
        return (gameBoard[x].cells[y].token === myColor || gameBoard[x].cells[y].token === "W");
    }
    return false;
};

safeCheckOpponentValue = function(x, y, myColor) {
    var opponentAColor = "B";
    var opponentBColor = "G";
    if (myColor === "B") opponentAColor = "R";
    if (myColor === "G") opponentBColor = "R";

    if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
        var cell = gameBoard[x].cells[y];
        return (gameBoard[x].cells[y].token === opponentAColor || gameBoard[x].cells[y].token === opponentBColor);
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
            gameBoard[loc1.x].cells[loc1.y].highlight = "highlight";
            gameBoard[loc2.x].cells[loc2.y].highlight = "highlight";
        }

        renderBoard();
    });
};

placeToken = function(x, y, color) {
    if (_.contains(["R","B","G"], color) && gameBoard[x].cells[y].token === "") {
        gameBoard[x].cells[y].token = color;
    }
    renderBoard();
};
clearToken = function(x, y) {
    gameBoard[x].cells[y].token = "";
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
    { value: "2S", suit: "S", locations:[{x:0, y:1}, {x:8, y:6}]},
    { value: "3S", suit: "S", locations:[{x:0, y:2}, {x:8, y:5}]},
    { value: "4S", suit: "S", locations:[{x:0, y:3}, {x:8, y:4}]},
    { value: "5S", suit: "S", locations:[{x:0, y:4}, {x:8, y:3}]},
    { value: "6S", suit: "S", locations:[{x:0, y:5}, {x:8, y:2}]},
    { value: "7S", suit: "S", locations:[{x:0, y:6}, {x:8, y:1}]},
    { value: "8S", suit: "S", locations:[{x:0, y:7}, {x:7, y:1}]},
    { value: "9S", suit: "S", locations:[{x:0, y:8}, {x:6, y:1}]},
    { value: "TS", suit: "S", locations:[{x:1, y:9}, {x:5, y:1}]},
    { value: "JS", suit: "S", locations:[]},
    { value: "QS", suit: "S", locations:[{x:2, y:9}, {x:4, y:1}]},
    { value: "KS", suit: "S", locations:[{x:3, y:9}, {x:3, y:1}]},
    { value: "AS", suit: "S", locations:[{x:4, y:9}, {x:2, y:1}]},

    { value: "2C", suit: "C", locations:[{x:1, y:4}, {x:3, y:6}]},
    { value: "3C", suit: "C", locations:[{x:1, y:3}, {x:3, y:5}]},
    { value: "4C", suit: "C", locations:[{x:1, y:2}, {x:3, y:4}]},
    { value: "5C", suit: "C", locations:[{x:1, y:1}, {x:3, y:3}]},
    { value: "6C", suit: "C", locations:[{x:1, y:0}, {x:3, y:2}]},
    { value: "7C", suit: "C", locations:[{x:2, y:0}, {x:4, y:2}]},
    { value: "8C", suit: "C", locations:[{x:3, y:0}, {x:5, y:2}]},
    { value: "9C", suit: "C", locations:[{x:4, y:0}, {x:6, y:2}]},
    { value: "TC", suit: "C", locations:[{x:5, y:0}, {x:7, y:2}]},
    { value: "JC", suit: "C", locations:[]},
    { value: "QC", suit: "C", locations:[{x:6, y:0}, {x:7, y:3}]},
    { value: "KC", suit: "C", locations:[{x:7, y:0}, {x:7, y:4}]},
    { value: "AC", suit: "C", locations:[{x:8, y:0}, {x:7, y:5}]},

    { value: "2D", suit: "D", locations:[{x:2, y:2}, {x:5, y:9}]},
    { value: "3D", suit: "D", locations:[{x:2, y:3}, {x:6, y:9}]},
    { value: "4D", suit: "D", locations:[{x:2, y:4}, {x:7, y:9}]},
    { value: "5D", suit: "D", locations:[{x:2, y:5}, {x:8, y:9}]},
    { value: "6D", suit: "D", locations:[{x:2, y:6}, {x:9, y:8}]},
    { value: "7D", suit: "D", locations:[{x:2, y:7}, {x:9, y:7}]},
    { value: "8D", suit: "D", locations:[{x:3, y:7}, {x:9, y:6}]},
    { value: "9D", suit: "D", locations:[{x:4, y:7}, {x:9, y:5}]},
    { value: "TD", suit: "D", locations:[{x:5, y:7}, {x:9, y:4}]},
    { value: "JD", suit: "D", locations:[]},
    { value: "QD", suit: "D", locations:[{x:6, y:7}, {x:9, y:3}]},
    { value: "KD", suit: "D", locations:[{x:7, y:7}, {x:9, y:2}]},
    { value: "AD", suit: "D", locations:[{x:7, y:6}, {x:9, y:1}]},

    { value: "2H", suit: "H", locations:[{x:5, y:4}, {x:8, y:7}]},
    { value: "3H", suit: "H", locations:[{x:5, y:5}, {x:8, y:8}]},
    { value: "4H", suit: "H", locations:[{x:4, y:5}, {x:7, y:8}]},
    { value: "5H", suit: "H", locations:[{x:4, y:4}, {x:6, y:8}]},
    { value: "6H", suit: "H", locations:[{x:4, y:3}, {x:5, y:8}]},
    { value: "7H", suit: "H", locations:[{x:5, y:3}, {x:4, y:8}]},
    { value: "8H", suit: "H", locations:[{x:6, y:3}, {x:3, y:8}]},
    { value: "9H", suit: "H", locations:[{x:6, y:4}, {x:2, y:8}]},
    { value: "TH", suit: "H", locations:[{x:6, y:5}, {x:1, y:8}]},
    { value: "JH", suit: "H", locations:[]},
    { value: "QH", suit: "H", locations:[{x:6, y:6}, {x:1, y:7}]},
    { value: "KH", suit: "H", locations:[{x:5, y:6}, {x:1, y:6}]},
    { value: "AH", suit: "H", locations:[{x:4, y:6}, {x:1, y:5}]}
];

gameBoard = [
    { cells: [
        {value: "W", token: "W"},
        {value: "2S", token: ""},
        {value: "3S", token: ""},
        {value: "4S", token: ""},
        {value: "5S", token: ""},
        {value: "6S", token: ""},
        {value: "7S", token: ""},
        {value: "8S", token: ""},
        {value: "9S", token: ""},
        {value: "W", token: "W"}]
    },
    { cells: [
        {value: "6C", token: ""},
        {value: "5C", token: ""},
        {value: "4C", token: ""},
        {value: "3C", token: ""},
        {value: "2C", token: ""},
        {value: "AH", token: ""},
        {value: "KH", token: ""},
        {value: "QH", token: ""},
        {value: "TH", token: ""},
        {value: "TS", token: ""}]
    },
    { cells: [
        {value: "7C", token: ""},
        {value: "AS", token: ""},
        {value: "2D", token: ""},
        {value: "3D", token: ""},
        {value: "4D", token: ""},
        {value: "5D", token: ""},
        {value: "6D", token: ""},
        {value: "7D", token: ""},
        {value: "9H", token: ""},
        {value: "QS", token: ""}]
    },
    { cells: [
        {value: "8C", token: ""},
        {value: "KS", token: ""},
        {value: "6C", token: ""},
        {value: "5C", token: ""},
        {value: "4C", token: ""},
        {value: "3C", token: ""},
        {value: "2C", token: ""},
        {value: "8D", token: ""},
        {value: "8H", token: ""},
        {value: "KS", token: ""}]
    },
    { cells: [
        {value: "9C", token: ""},
        {value: "QS", token: ""},
        {value: "7C", token: ""},
        {value: "6H", token: ""},
        {value: "5H", token: ""},
        {value: "4H", token: ""},
        {value: "AH", token: ""},
        {value: "9D", token: ""},
        {value: "7H", token: ""},
        {value: "AS", token: ""}]
    },
    { cells: [
        {value: "TC", token: ""},
        {value: "TS", token: ""},
        {value: "8C", token: ""},
        {value: "7H", token: ""},
        {value: "2H", token: ""},
        {value: "3H", token: ""},
        {value: "KH", token: ""},
        {value: "TD", token: ""},
        {value: "6H", token: ""},
        {value: "2D", token: ""}]
    },
    { cells: [
        {value: "QC", token: ""},
        {value: "9S", token: ""},
        {value: "9C", token: ""},
        {value: "8H", token: ""},
        {value: "9H", token: ""},
        {value: "TH", token: ""},
        {value: "QH", token: ""},
        {value: "QD", token: ""},
        {value: "5H", token: ""},
        {value: "3D", token: ""}]
    },
    { cells: [
        {value: "KC", token: ""},
        {value: "8S", token: ""},
        {value: "TC", token: ""},
        {value: "QC", token: ""},
        {value: "KC", token: ""},
        {value: "AC", token: ""},
        {value: "AD", token: ""},
        {value: "KD", token: ""},
        {value: "4H", token: ""},
        {value: "4D", token: ""}]
    },
    { cells: [
        {value: "AC", token: ""},
        {value: "7S", token: ""},
        {value: "6S", token: ""},
        {value: "5S", token: ""},
        {value: "4S", token: ""},
        {value: "3S", token: ""},
        {value: "2S", token: ""},
        {value: "2H", token: ""},
        {value: "3H", token: ""},
        {value: "5D", token: ""}]
    },
    { cells: [
        {value: "W", token: "W"},
        {value: "AD", token: ""},
        {value: "KD", token: ""},
        {value: "QD", token: ""},
        {value: "TD", token: ""},
        {value: "9D", token: ""},
        {value: "8D", token: ""},
        {value: "7D", token: ""},
        {value: "6D", token: ""},
        {value: "W", token: "W"}]
    }
];