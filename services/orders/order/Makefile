default: build release

dev:
	@okteto up -n orders-service

kill-dev:
	@okteto down -n orders-service

cycle:
	@kubectl delete -f order.yaml
	@kubectl apply -f order.yaml
	@kubectl wait $$(kubectl get pods -o name -n orders-service | grep -i order) --for=condition=ready --timeout=30s -n orders-service
	@kubectl logs -f -n orders-service $$(kubectl get pods -n orders-service | grep order | grep Running | cut -f1 -d ' ' | xargs) order

ladaptor:
	@kubectl logs -f -n orders-service $$(kubectl get pods -n orders-service | grep order | grep Running | cut -f1 -d ' ' | xargs) order-adaptor
	

install: build release redis-secret deploy

build:
	@echo "\033[0;32mBuilding order\033[0m"
	@docker build -t localhost:5000/labs/order .

release:
	@echo "\033[0;32mPushing order\033[0m"
	@docker push localhost:5000/labs/order

deploy:
	@kubectl apply -f order.yaml
	@echo "\033[0;32mWaiting for order pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -o name -n orders-service | grep order) --for=condition=ready --timeout=30s -n orders-service

delete:
	@kubectl delete -f order.yaml

redis-secret:
	@echo "\033[0;32mStoring event-adaptor creds\033[0m"
	@kubectl create secret generic redis-password -n orders-service --from-literal=password=$$(kubectl get secret --namespace platform redis -o jsonpath="{.data.redis-password}" | base64 --decode)

logs:
	@kubectl logs -n orders-service $$(kubectl get pods -n orders-service | grep order | head -n 1 | cut -d' '  -f1) | jq
