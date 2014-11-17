#!/bin/bash
set -e

files=(
    boardCell.html
    bower_components
    fladdermus.js
    gameBoard.js
    hiScores.html
    img
    index.html
    smiley.html
    uncover.js
    util.js
)

cd $(git root)
git stash

tmp=$(mktemp -d)
trap "rm -rf $tmp" EXIT

cp -r traditional $tmp
git checkout gh-pages
gitdir=$PWD

cd $tmp/traditional
cp -r ${files[@]} $gitdir
