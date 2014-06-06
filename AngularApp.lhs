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
