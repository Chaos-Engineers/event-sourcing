.PHONY: cycle install dev run build release redis-secret deploy delete logs

cycle: delete-orders build release deploy-orders
install: install-db install-orders

install-orders:
	@make -C orders install

install-db:
	@make -C db install


