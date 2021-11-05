.PHONY: cycle install dev run build release redis-secret deploy delete logs

cycle:
	@kubectl delete -f adaptor-operator.yaml
	@kubectl apply -f adaptor-operator.yaml
	@kubectl wait $$(kubectl get pods -o name -n platform | grep -i adaptor-operator) --for=condition=ready --timeout=30s -n platform
	@kubectl logs -f -n platform $$(kubectl get pods -n platform | grep adaptor-operator | grep Running | cut -f1 -d ' ' | xargs) main

install: build release redis-secret db-secret deploy

dev:
	@okteto up -n platform

kill-dev:
	@okteto down -n platform

build:
	@echo "\033[0;32mBuilding adaptor-operator\033[0m"
	@docker build -t localhost:5000/labs/adaptor-operator .

release:
	@echo "\033[0;32mReleasing adaptor-operator API\033[0m"
	@docker push localhost:5000/labs/adaptor-operator

redis-secret:
	@echo "\033[0;32mStoring redis creds\033[0m"
	@kubectl create secret generic redis-password -n platform --from-literal=password=$$(kubectl get secret --namespace platform redis -o jsonpath="{.data.redis-password}" | base64 --decode)

deploy:
	@echo "\033[0;32mDeploying adaptor-operator\033[0m"
	@kubectl apply -f adaptor-operator.yaml
	@echo "\033[0;32mWaiting for adaptor-operator API pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -o name -n platform | grep -i adaptor-operator) --for=condition=ready --timeout=30s -n platform

delete:
	@kubectl delete -f adaptor-operator.yaml

logs:
	@kubectl logs -n platform $$(kubectl get pods -n platform -o name | grep -i adaptor-operator | head -n 1 | cut -d'/' -f2) | jq -C '.' | sed 's/\\n/\n/g; s/\\t/\t/g'

flogs:
	@kubectl logs -f -n platform $$(kubectl get pods -n platform -o name | grep -i adaptor-operator | head -n 1 | cut -d'/' -f2)

log:
	@kubectl logs -n platform $$(kubectl get pods -n platform -o name | grep -i adaptor-operator | head -n 1 | cut -d'/' -f2)

