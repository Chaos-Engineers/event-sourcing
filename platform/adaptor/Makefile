.PHONY: install cycle delete adaptor build release deploy redis-secret
install: adaptor
cycle: delete install

build-dev:
	@docker build -t bryandollery/redis-rest-adaptor -f Dockerfile_dev .

adaptor: build release redis-secret deploy

build:
	@echo "\033[0;32mBuilding adaptor\033[0m"
	@docker build -t bryandollery/redis-rest-adaptor .

run-dev:
	@docker run -it --rm -p 8080:80 -e REDIS_URL=redis://localhost:30002/redis -v ./registry:/registry bryandollery/redis-rest-adaptor

release:
	@echo "\033[0;32mPushing adaptor\033[0m"
	@docker push bryandollery/redis-rest-adaptor

redis-secret:
	@echo "\033[0;32mStoring adaptor creds\033[0m"
	@kubectl create secret generic redis-password -n platform --from-literal=password=$$(kubectl get secret --namespace platform redis -o jsonpath="{.data.redis-password}" | base64 --decode)

deploy:
	@kubectl apply -f adaptor.yaml
	@echo "\033[0;32mWaiting for adaptor pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -n platform -o name | grep adaptor) --for=condition=ready --timeout=30s -n platform

delete:
	@kubectl delete -f adaptor.yaml
