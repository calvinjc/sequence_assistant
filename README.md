#Sequence Board Game Assistant

This is meant as an assistant to the game Sequence.  It does not have the mechanics to actually play the game yet. It is a UI layer to allow me to experiment with and iteratively improve an algorithm to evaluate the comparative value of playing on any given square.  The end result hopefully being an AI player that could make decisions and play against the user.  If you need information about the game Sequence itself check out the wikipedia page: https://en.wikipedia.org/wiki/Sequence_(game)

Currently the game only allows two teams Red and Blue. I plan on adding an option for a third Green team.

###First the terminology:
The cards are represented by their rank and their suit where S = spades, C = clubs, H = hearts, D = diamonds.  So 7D is the 7 of Diamonds, KH is the King of Hearts, etc.  In the game of sequence Jacks are unique depending on the number of eyes visible on the card.  Obviously this isn't visible with the current notation so it is necessary to understand that the Jack of Diamonds (JD) & Jack of Clubs (JC) have two eyes and can place a token anywhere on the board, while the Jack of Hearts (JH) and Jack of Spades (JS) have one eye and can remove a token from anywhere on the board.

While speaking about the Jacks, it is important to note that the current version does not take one eyed jacks into account because it does not calculate the value of removing a token.  This could be a future enhancement.

###Using the app:
As mentioned before, this app is intended to be used as an assistant to an external game and is not a game itself.  You can enter the cards in your hand by selecting a card under the "Add a card to your hand" label.  Any locations where that card can be played will be highlighted.  You can remove cards from your hand by clicking on the card in your hand.

You can place tokens on the board by selecting "Add Red Token" or "Add Blue Token" and then selecting the location on the board where you want to add the token.  Tokens can be removed by selecting a location with a token when a One Eyed Jack is in your hand, or (in case a mistake is made) you can also remove a token by selecting the location after the corresponding "Add [color] Token" button has been pressed.

When a token is placed on the board all of the unoccupied locations are updated to recalculate their value.  Value means how valuable would it be for a team to place a token on that location. Sequence doesn't have scores. The specific number or scale itself doesn't mean anything except that higher is better (more valuable).  Some squares are worth more to one team than to another team.  However, it is nearly as valuable to prevent the other team from scoring as it is to score yourself.  So a total value is calculated by adding the value the location represents to each team.  You can think of these two values as its offensive and defensive value depending on which team you're on.  Since the total value is the sum of these two values, the total value is the same for either team.  The theory being that if placing a token on a space is valuable to the other team then it is equally valuable to your team to prevent them from placing a token there.

Side Note: If you take a look at the code you will see that this "value" is referred to as "worth" so as not to be confused with the "value" of a card (JH, AD, 7S, etc.). A refactor might be helpful to eliminate this confusion.

###Display options:
By default the game board will display the card and the total value associated with each location on the board.  There is also an option to display the value for each color.  It can often be helpful to look at the color value breakdown to understand how it came up with the total value.  The board can display the Total Value, Color Values or both.

There is also an option to only show the values for the locations associated with the cards in your hand.  This can be helpful if you find yourself confused or distracted by all of the values and want to simplify things by only seeing the values for the locations where you can actually place a token.

##Understanding the algorithm: (the fun part)

... To Be Continued ...

###Known issues (future enhancement options):
- Take the cards in your hand into account when calculating value. (when you have 2 cards in your hand that are near each other this could add a bonus)
- Make it slightly more valuable to create open ended sets rather than have a gap in the middle. example: the four tokens O O O _ O are not as valuable as 4 in a row open on either end _ O O O O _ 
- Calculate the value of removing an existing token for One Eyed Jacks

