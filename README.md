Code for a Minesweeper clone, *Fladdermusröj*.

[Play now\!](https://chreekat.net/fladdermus)

# About the project

## Motivation

The point of this repo is to experiment with web front end technology. But what
does it mean to "experiment"? Composability is the most important aspect of any
architecture, so I am testing to what degree these techs support, enable, and
champion composable interaction design.

## Status

The live app was written in Angular v1, many moons ago. It was gratifying to
write software that *friends of mine actually used*, but it's a dead end for
future research. Now I am looking at two GHCJS tools:
[Reflex-Dom](https://github.com/reflex-frp/reflex-dom) and
[Miso](https://haskell-miso.org/). I am interested to what degree I can specify
the application independently of those libraries, as well as what their specific
implementations will look like.

# Research themes

## Composable UI elements

I assert that a composable element composes on three axes: generation of
user interface, reception of program inputs, and transmission of program
outputs. This three-way composition can be modeled as

        Monad ui => ComponentInputs -> ui ComponentOutputs.

This model allows expressive, monadic composition of the UI, while plain old
functions handle programmatic inputs and outputs with their usual verve. I'm not
sure it'll work out yet, however: Filling in the details and constraints on the
types is a work in progress. Nonetheless, I can use this to start describing
the components in the app.

### Fladdermus components

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
          <li>UI function for composing individual cells
        </ul>
      <td>
        <ul>
          <li>Game won/lost status
          <li>Current score
        </ul>
      <td>Shows the game board
      <td><i>We see some composition here: The table needs to know
      all cell statuses, because it has to feed them to the cells
      it uses. It also needs the function for creating cells!</i>
</table>

(I had to use HTML tables and pandoc in order to figure out how to get this far
in Markdown. I'll have to go all HTML eventually.)

## Specifying the UI independent of framework

I am always disappointed how quickly I, as an app developer, must begin working
within conceptual frameworks that are unrelated to my application's domain.
How much of an app's semantics could be specified independent of any concrete UI
choice? The question seems to never be addressed. This is a pity.

For one thing, an app defined independent of a concrete UI would allow exploring
mechanically-generated interfaces. An ecosystem of apps with such UIs would be
user-customizable, providing a holistic, consistent, accessible system---with
as many varieties as there are users (Val). (use quote) For my immediate
purpose, however, an independent specification would let me share the maximum
amount of domain-specific descriptors between the different Fladdermusröj
implementations. I can imagine that there may be benefits in the way of formal
guarantees, too. Can we start with a Servant-like UI description?

### Borrowing from Servant

*Down a dim, dripping alley, arriving at a dead end*

Servant allows a web service author to describe an entire API---including all
routes served, with all inputs and outputs---independent of any implementation
of the service or endpoint handlers. Can we borrow from this design?

I don't have any idea what I'm talking about. Let's just throw words at the wall
and see what sticks.

Servant has users define an API as a type. The type is the contract between all
consumers. Types are logical statements; compilers check the given proof
provided by a programmers. Take the 'serve' consumer: It asks the programmer to
prove that they have implemented handlers for all routes that take the right
arguments and return the right responses.

Can we describe a UI as a type/contract? Can we envision consumers that provably
uphold the contract?

Such a type would be composable, so we can start with something basic, like the
Happy Face. It may help to envision different concrete UIs and expand from
there.

* Vanilla html/javascript

# References

Val: Valkonen, Tuomo. *Vis/Vapourware Interface Synthesiser*. http://tuomov.iki.fi/software/dl/vis-paper.pdf.

Servant: Servant Maintainers. https://github.com/haskell-servant/servant

