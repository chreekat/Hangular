Code for a Minesweeper clone, *Fladdermusröj*.

[Play now\!](https://chreekat.net/fladdermus)

# Motivation

The point of this repo is to experiment with web front end technology.
But what does it mean to "experiment"? Composability is the most
important aspect of any architecture, so I am testing to what degree
these techs support, enable, and champion composable interaction design.
The goal for each demo is to implement a clone of Minesweeper. For
in-joke reasons, the clones are called Fladdermusröj.

I assert that a composable element composes on three axes: generation of
user interface, reception of program inputs, and transmission of program
outputs. This three-way composition is easily modeled as

        Monad ui => ProgramInputs -> ui ProgramOutputs.

This allows expressive, monadic composition of the UI, while plain old
functions handle programmatic inputs and outputs with their usual verve.

What components exist in Fladdermusröj? I apologize in advance for the
illegibility of this table, but it does give the overview:

<table>
  <thead>
    <tr class="header">
      <th>Component
      <th>Inputs
      <th>Outputs
      <th>UI Behavior
      <th>Notes
  <tbody>
    <tr class="odd">
      <td>Happy Face
      <td>Face to show
      <td>Click notification
      <td>Shows an image, the choice of which is given as an
      instruction
      <td><i>Click notification is used to start a new game</i>
    <tr class="even">
      <td>Timer
      <td><i>none</i>
      <td><i>none</i>
      <td>Shows an incrementing timer
      <td><i>No need for a reset command; just replace with a new
      Timer instead.</i>
    <tr class="odd">
      <td>Current Score
      <td>Score to show
      <td><i>none</i>
      <td>Shows the current score
      <td>
    <tr class="even">
      <td>High Scores
      <td>
        <ul>
          <li>Command: Interactively add a new score (triggers need
          for user input)
          <li>All scores to show
        </ul>
      <td>New score details (from user input)
      <td>Shows all scores, and shows an interactive input for user
      info when required
      <td>
    <tr class="odd">
      <td>Game Size
      <td>Current size choice
      <td>New size choice (from user input)
      <td>Shows a selection of game sizes to choose from
      <td>
    <tr class="even">
      <td>Table Cell
      <td>
        <ul>
          <li>Cover status
          <li>Flag status
          <li>Bat presence status
          <li>Game won/lost status
        </ul>
      <td>Click notification (one of: uncover, toggle flag, uncover
      cascade)
      <td>Shows an image of the particular cell in the game
      <td>
    <tr class="odd">
      <td>Table
      <td>
        <ul>
          <li>Game size
          <li>List of cover, flag, and bat presence statuses for
          all cells
        </ul>
      <td>
        <ul>
          <li>Game won/lost status
          <li>Current score
        </ul>
      <td>Shows the game board
      <td><i>We see some composition here: The table needs to know
      all cell statuses, because it has to feed them to the cells
      it uses.</i>
</table>

(I had to use HTML tables and pandoc in order to figure out how to get this far
in Markdown. I'll have to go all HTML eventually.)

# Status

The live app was written in Angular v1, many moons ago. It was very gratifying
to write software that *friends of mine* actually used, but it's a dead end for
future research. Now I am looking at two GHCJS tools: Reflex-Dom and Miso. I am
interested to what degree I can specify the application independently of those
libraries, as well as what their specific implementations will look like.
