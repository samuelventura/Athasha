#!/bin/sh -x

MOD="github.com/samuelventura/athasha/abe"
(cd abe; go install $MOD/cmd/ash && (cd ..; ash ajs/$1))
