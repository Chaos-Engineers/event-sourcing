.PHONY: install _install delete cycle redis-password default

cycle: delete install

install:
	@helm install redis bitnami/redis --namespace platform

delete:
	@helm delete redis

