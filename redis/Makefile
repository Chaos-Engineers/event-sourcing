.PHONY: up down cycle install-redis redis-password default

default: up

cycle: down up

up: install-redis redis-password

down:
	@helm delete redis
	@kubectl delete namespace redis

install-redis:
	@helm repo add bitnami https://charts.bitnami.com/bitnami 
	@kubectl create namespace redis
	@helm install redis bitnami/redis --namespace redis

redis-password : P = $$(kubectl get secret --namespace redis redis -o jsonpath="{.data.redis-password}" | base64 --decode)
redis-password:
	@echo "\033[0;31m${P}\033[0m"
