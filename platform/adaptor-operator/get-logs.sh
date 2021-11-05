#!/bin/bash

curl -X POST http://localhost:30000/adaptor-operator/log
pods=$(kubectl get pods -n platform | grep adaptor-operator | awk '{print $1}')
kubectl logs -f -n platform $pods