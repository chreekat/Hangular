\begin{spec}
module AngularApp where

import Text.Blaze.Html5

data AngularApp = AApp AngularTemplate AngularScope

data AngularTemplate = ATmpl Html [ScopeLens] [Interpolation]
\end{spec}

While riding, I was thinking about what describes an Angular app. I
realized it starts with the template. Hence the definition of AngularApp
above (which will have to be filled out more later.)

Templates, in turn, are mostly (Blaze) html. The html is marked up,
however, and those markups are important in two ways. One is, of course,
they define the behavior of the app. The other is that they put certain
requirements on the scope. There are two types of values that do this. The
first is scope lenses, used in e.g. the ng-model directive. It's a lens, of
course, because it is used both for getting and for setting. The other is
interpolations, found most notably within {{double brackets}}. These are
*only* getters, but they are compound. So, actually, I bet this second type
is actually a special case of the first. I'll keep them separate for now,
though, and I'll probably disallow compound interpolations anyway.

At compile time (i.e. Haskell run-time), the list of scope lenses required
by AngularTemplate will be compared to the available properties of
AngularScope. Missing properties will be a compile time error.

The easiest way to generate an AngularTemplate is the following:

\begin{spec}
ngTemplate :: Html -> AngularTemplate
ngTemplate h = ATmple h [] []
\end{spec}

That's rather boring, of course. I was having some ideas about reverse
lifting, something like

\begin{spec}
import Prelude hiding (($))
-- BROKEN: need to turn into a combinator
h $< (ATmpl h' ls is) = ATmpl (h h') ls is
(ATmpl h ls is) >$ h = ATmpl (h h') ls is)
infixl ($<) 9
infixl (>$) 9
infixl ($) 8
\end{spec}

The idea is to have some html like

div $ do
  $< (ngTemplate span) ! ngModel "x" $ "This is an AngularTemplate" >$ do
  span "This is regular Html"

Or, to get at the thought that provoked this line of thinking, I want some
way to call out a more-structured value within a sea of lesser-structured
values. I don't want to have to use ngTemplate fucking everywhere. Think
about double brackets: They cause the entire template to have extra structure,
but only dirty the syntax where that extra structure is used. I want to
mimic that.

That's for a later day, though. For now, lifts all around!!

Angular directives are the structure-creating values. Everything else is
just Html. Directives show up in two places: As elements and as
attributes. Attributes can modify both Html and AngularTemplates, ideally.
Modifying Html gets back to that same syntax convenience, though, so it's
out for now.

I realized there's more to templates. There's also event sources like
ng-click, and then there's the somewhat special ng-app and ng-controller.
There's also the concept of nested and changing scopes. Also, inherited vs
isolate scopes. So:

Template
    - html
    - scope heirarchy
        - ng-app
        - ng-controller
    - scope lenses
    - event sources


Yesterday I saw some guy talking about making a wrapper for React.js. His
language could be compiled to html or to js. I guess mine will do that,
too. Whatever describes a directive will have both an Html representation
and a a Js representation. The Js rep will include controllers, linkers,
config, and relations between 3rd-party controllers. So maybe I can use it
for that!

Gonna continue the description of directives. They produce two things, as
mentioned, but not Html and JsRep: AngTemplate and JsRep. It's kinda funny
because they will provide both requirements and fulfillments of those
requirements, in terms of JS structure.

Maybe JsStructure is a better name.

Time to break out some terminology.

data AngularTemplate / NgTemplate / AngTemplate / AngTmpl / NgTmpl / AngrTmpl
-- product type with fields of:
    Html
    [ScopeRequirement]
    [Interpolation]

data ScopeRequirement = ModelReq String
                      | CntlrReq String
                      | ElemDirectiveReq String
                      | AttrDirectiveReq String

To be continued... first, I need to write an interesting web app. The
rationale for this is along the lines of "I have yet to see [I should
really look harder] any Haskell/Angular integration that uses the truly
great features of Angular. The reactive binding to the template is just
scratching the surface. Defining directives and all they entail is
significant and allows one to write declarative web apps much the way that
Haskell allows one to write declarative ... anything. It feels very
familiar to write some high-level "pseudocode" that ends up being REAL code
by drilling down on the definitions.

To demonstrate the similarities, and to provide a motivation for Hangular,
I'll start with a "traditional" html/js Angular app. A real one. With
nested directives, interconnected directives, compilers, linkers, and bears
-- oh my!

Oh shit, events. Keep track of which ones are available? Use warnings when
events aren't exported or used.

Will also need to talk about different types of composability. That's the
whole point of the directive object: describing how to compose directives.
Composition is heirarchical, since sibling directives have
inter-dependencies as well as parent/child directives.

Also regarding composability is preserving associability. If you 'combine'
two directives, the result should be no different than writing a single
directive. This means identical exposed scope objects, exposed events, and
whatever else!

An interesting problem: correctly sequencing actions when different
templates can create scope changes that depend on each other. That needs an
example. Here is the motivation:

mainTemplate
------------
<foo-directive ng-click="tweakMyScope()"></foo-directive>

fooTemplate
-----------
<span ng-click="tweakParentScope()"></span>

Presumably these both run, but what is the order? I suppose you could make
arguments in both directions. In short, this does not compose well, which
makes me think it should be discouraged.

~~~

Just had an interesting problem with scope. A directive with a non-isolate
scope clobbered the parent scope by doing "scope.m = ..." in its linker.


~~~

The problem of sequencing actions is solved by using data dependencies
instead of action dependencies. In the example above, tweakParentScope
should actually just tweak its own, child scope, and then any required
changes in the parent scope should propagate from those changes. In other
words, the parent scope needs a \$watch on the data the child action
updates.

A potential problem with this notion is the inefficiency of watching a huge
structure when all we care about is one piece of that structure. I'd have
to watch a group of watched collections. I could also create a view into
the data though, and just watch the view. Not sure that's any better?
Basically the same thing. Easier to implement, though. No. It's identical:
Would need a zillion watches to build the view at the right times.

The principle I'm trying to maintain is that the parent directive handles
its own, global shit while the child directive doesn't need to care. This
is a specific case of a more general principle that has a variety of names:
separation of concerns. Maybe even purity. Independence and thus reuse.

I'm also trying to avoid events. Ideally, changing a value *IS* the event.
The programmer would benefit from not needing to remember to fire an event
when a value changes; they could simply change the value.

I can see a solution where the child directive changes its state and then
fires an "I changed" event, which the parent then processes, but how nice
would it be if the child directive merely changes its state and the parent
is automatically updated? Or rather, the parent directive can choose to
care or not care, precisely as if the child had also fired an event.

~~~ 11-jun-14 12:00

Up next: Specify game logic, including clicks, shift clicks, uncovering
bombs, and so forth.

~~~

Something for the paper: Compare and contrast methods for communicating
between directives. Attempt to unify as well.

~~~

Sucks not having internet. I know I could easily figure out how to manage
right-clicks in Angular on the internet, but I can't figure it out on my
own...

~~~ 23-jun 16:39

Using right clicks means creating a directive ngContextmenu for contextmenu
events.

I want to spend today organizing some tasks so I can make constant progress
for the next week. Have some goals.

I remembered another way that UI components compose. The inputs they expose
to the user add. This is important for making ui-generators (like VIS)
possible. A component that exposes UI controls should expose the SAME
control specification, regardless of how its subcomponents are arranged.

~~~ 25-jun 12:40

At this point I'm kinda fed up with trying to make board-cell an
independent directive. It has to communicate with the parent directive in
ever more complicated ways. Is it not possible to make the delineation
wherever the developer wants? Is there a skill involved in choosing the
right amount of abstraction?

I hope not, because my big goal is to take that first-pass, high-level
sketch of the app, and then implement the app by filling in the pieces, not
by keeping that sketch in my head while I write code that is designed for
the fucking computer instead of the human.

~~~ 26-jun 19:12

Te answer is obvious: use data, not fucking signals. Duh? I was loathe to
add more scope-property dependencies between boardCell and the outer
controller, but that's actually just fine and really the way to go. Much
better than overly-general "signals" that will only actually ever be used
by one parent class.

~~~ 01-nov 22:49

Now I added "gameStatus" and hooked it into a few things. There's stuff
missing, though. I also added the bugs file. I converted spaces to tabs,
which is probably a terrible idea. But the game seems much more playable
now!

~~~ 14-nov 15:40

Things have gone very well. The game is quite playable. There's a lot left
to do, however: pre-game and post-game controls including high scores and
board size controls.

I was just about to create the function that moves a bat if it is on the
first square a player clicks on (so one can't lose on the first turn), and
I realized that a table should always include its height and width. A
single object should encapsulate all of that. So now, of course, I need to
refactor a bunch of code -- and I'm sure I'll break something! Javascript
strikes!!

~~~ 14-nov 21:05

Adding "gameState.js" which is just comments:

// The logic of fladdermus.
//
// For completeness, I will include actions that are already
// half-implemented. One of the games being played here is answering the
// question of whether actions/updates can compose between parent/child
// directives.
//
// If a covered square is clicked, it is uncovered.
//   - cells handle this
// If a mus is uncovered, the game is lost.
//   - cells uncover themselves, so if they have musen they must emit
//     'mus-angry'
// If the last empty square is uncovered, the game is won.
//   - cells uncover themselves. Track game state's number of uncovered
//     cells remaining, and emit 'mus-happy' at the proper time.
// If an uncovered square is control-clicked, do the uncoverCascade.
// If a covered square is right-clicked, toggle between
//    flagged/question/unflagged. This is cell-independent as well.
// If smileyFace is clicked, reset the board game and the timer.
// While mouse is down, smileyFace is uh-oh face
//
// The uncoverCascade is its own rather complex set of steps. The uncover
// cascade needs to stop if a mus is uncovered. So, it has to run FIFO.
//
// Same goes for creating a new board game.
