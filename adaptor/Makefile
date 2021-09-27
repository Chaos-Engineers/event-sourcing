default: rdev

dev: make-dev run-dev

make-dev:
	@docker build -t bryandollery/redis-rest-adaptor -f Dockerfile_dev .

adaptor: prod push redis-secret deploy

prod:
	@echo "\033[0;32mBuilding adaptor\033[0m"
	@docker build -t bryandollery/redis-rest-adaptor .

run-dev:
	@docker run -it --rm -p 8080:80 -e REDIS_URL=redis://localhost:30002/redis -v ./registry:/registry bryandollery/redis-rest-adaptor

push:
	@echo "\033[0;32mPushing adaptor\033[0m"
	@docker push bryandollery/redis-rest-adaptor

redis-secret:
	@echo "\033[0;32mStoring adaptor creds\033[0m"
	@kubectl create namespace adaptor
	@kubectl create secret generic redis -n adaptor --from-literal=password=$$(kubectl get secret --namespace redis redis -o jsonpath="{.data.redis-password}" | base64 --decode)

deploy:
	@kubectl apply -f adaptor.yaml
	@echo "\033[0;32mWaiting for adaptor pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -o name -n adaptor | grep adaptor) --for=condition=ready --timeout=30s -n adaptor

delete:
	@kubectl delete -f adaptor.yaml
