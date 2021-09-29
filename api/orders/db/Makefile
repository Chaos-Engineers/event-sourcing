.PHONY: install delete

install:
	@echo "Installing MongoDB"
	@helm install db bitnami/mongodb --namespace=api

delete:
	@helm delete db