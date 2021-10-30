.PHONY: cycle install dev run build release redis-secret deploy delete logs

cycle: delete-orders build release deploy-orders
install: install-db install-orders
delete: delete-orders delete-db

install-orders:
	@make -C orders install

delete-orders:
	@make -C orders delete

install-db:
	@make -C db install

delete-db:
	@make -C db delete
