<h1>Maker Hold'em</h1>

<h2>An online Texas Hold'em Poker Game</h2>

<p>This project, still in developement, uses WebSockets and Node.js to create an interactive multiplayer poker game following the rules of Limit Texas Hold'em.</p>

<h3>Current Features</h3>
<ul>
	<li>Initializes game with eight players</li>
	<li>Creates 52 card deck and randomly deals cards out to players on each hand</li>
	<li>Allows rounds of betting based on the rules of Limit Texas Hold'em</li>
	<li>Deals out random community cards after each round of betting</li>
	<li>Subtracts chips from each player and adds them to pot after each bet</li>
	<li>Ships pot to last player remanining after other players fold</li>
	<li>If more than one player remains, calculates which player(s) and ships the pot accordingly</li>
	<li>Starts new hand with passed button and blinds</li>
</ul>

<h3>Features in Development</h3>
<ul>
	<li>Remove player from game when out of chips</li>
	<li>Account for sidepots when shorter stacks are all-in</li>
	<li>Emit to particular sockets, allowing cards and action buttons to only be seen by appropriate player</li>
	<li>Allow users to enter their own names on signup</li>
	<li>Allow more than one game to be played simultaneously</li>
	<li>Allow options for other games such as No-Limit Hold'em, Omaha, Stud, etc...</li>
</ul>