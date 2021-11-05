#!/bin/bash

if [ -z "$1" ]
then
  curl -Ls http://localhost:30000/orders | jq
else
  echo "http://localhost:30000/orders/$1" 
  curl -Ls "http://localhost:30000/orders/$1" 
fi