.PHONY: install cycle delete adaptor build release deploy redis-secret

install: build release redis-secret deploy

cycle: delete build release deploy logs

build-dev:
	@docker build -t labs/redis-rest-adaptor -f Dockerfile_dev .

build:
	@echo "\033[0;32mBuilding adaptor\033[0m"
	@docker build -t localhost:5000/labs/redis-rest-adaptor .

run-dev:
	@docker run -it --rm -p 8080:80 -e REDIS_URL=redis://localhost:30002/redis -v ./registry:/registry labs/redis-rest-adaptor

release:
	@echo "\033[0;32mPushing adaptor\033[0m"
	@docker push localhost:5000/labs/redis-rest-adaptor

redis-secret:
	@echo "\033[0;32mStoring adaptor creds\033[0m"
	@kubectl create secret generic redis-password -n platform --from-literal=password=$$(kubectl get secret --namespace platform redis -o jsonpath="{.data.redis-password}" | base64 --decode)

deploy:
	@kubectl apply -f adaptor.yaml
	@echo "\033[0;32mWaiting for adaptor pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -n platform -o name | grep adaptor) --for=condition=ready --timeout=30s -n platform

delete:
	@kubectl delete -f adaptor.yaml

logs:
	@kubectl logs -n platform $$(kubectl get pods -n platform | grep adaptor | head -n 1 | cut -d' '  -f1) | jq
