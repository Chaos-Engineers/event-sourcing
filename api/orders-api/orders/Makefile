.PHONY: cycle install dev run build release redis-secret deploy delete logs

cycle:
	@kubectl delete -f orders.yaml
	@kubectl apply -f orders.yaml
	@kubectl wait $$(kubectl get pods -o name -n orders-api | grep -i orders) --for=condition=ready --timeout=30s -n orders-api
	@kubectl logs -f -n orders-api $$(kubectl get pods -n orders-api | grep orders | grep Running | cut -f1 -d ' ' | xargs) main

install: build release redis-secret db-secret deploy

dev:
	@okteto up -n orders-api

kill-dev:
	@okteto down -n orders-api

build:
	@echo "\033[0;32mBuilding orders API\033[0m"
	@docker build -t localhost:5000/labs/ordersapi .

release:
	@echo "\033[0;32mReleasing orders API\033[0m"
	@docker push localhost:5000/labs/ordersapi

redis-secret:
	@echo "\033[0;32mStoring redis creds\033[0m"
	@kubectl create secret generic redis-password -n orders-api --from-literal=password=$$(kubectl get secret --namespace platform redis -o jsonpath="{.data.redis-password}" | base64 --decode)

db-secret:
	@echo "\033[0;32mStoring db creds\033[0m"
	@kubectl create secret generic api-db-password -n orders-api --from-literal=password=$$(kubectl get secret --namespace orders-api db-mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 --decode)

deploy:
	@echo "\033[0;32mDeploying orders API\033[0m"
	@kubectl apply -f orders.yaml
	@echo "\033[0;32mWaiting for orders API pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -o name -n orders-api | grep -i orders) --for=condition=ready --timeout=30s -n orders-api

delete:
	@kubectl delete -f orders.yaml

logs:
	@kubectl logs -n orders-api $$(kubectl get pods -n orders-api -o name | grep -i orders | head -n 1 | cut -d'/' -f2) | jq -C '.' | sed 's/\\n/\n/g; s/\\t/\t/g'

flogs:
	@kubectl logs -f -n orders-api $$(kubectl get pods -n orders-api -o name | grep -i orders | head -n 1 | cut -d'/' -f2)

log:
	@kubectl logs -n orders-api $$(kubectl get pods -n orders-api -o name | grep -i orders | head -n 1 | cut -d'/' -f2)

