.PHONY: install _install delete cycle redis-password default

cycle: delete install

install:
	@helm install redis bitnami/redis --namespace platform --set replica.replicaCount=1 --set architecture=standalone

delete:
	@helm delete redis

