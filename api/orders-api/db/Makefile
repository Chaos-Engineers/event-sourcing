.PHONY: install delete

install:
	@echo "Installing MongoDB"
	@helm install db bitnami/mongodb --namespace=api

delete:
	@echo "Deleting MongoDB"
	@helm delete db --namespace=api

