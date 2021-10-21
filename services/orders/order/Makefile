default: build release

dev:
	@okteto up -n contexts-orders

down:
	@okteto down -n contexts-orders

cycle: down delete install dev

install: build release deploy

build:
	@echo "\033[0;32mBuilding order\033[0m"
	@docker build -t localhost:5000/labs/order .

release:
	@echo "\033[0;32mPushing order\033[0m"
	@docker push localhost:5000/labs/order

deploy:
	@kubectl apply -f order.yaml
	@echo "\033[0;32mWaiting for order pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -o name -n contexts-orders | grep order) --for=condition=ready --timeout=30s -n contexts-orders

delete:
	@kubectl delete -f order.yaml

logs:
	@kubectl logs -n contexts-orders $$(kubectl get pods -n contexts-orders | grep order | head -n 1 | cut -d' '  -f1) | jq
