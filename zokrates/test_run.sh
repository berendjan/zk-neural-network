#!/bin/bash

set -e

for FILE in layers.zok signed_field.zok
do
    # compile
    zokrates compile -i $FILE --debug
    # perform the setup phase
    zokrates setup
    # execute the program
    zokrates compute-witness
    # generate a proof of computation
    zokrates generate-proof
    # or verify natively
    zokrates verify
done