.PHONY: install delete cycle

install:
	@make -C context install
	@make -C orders install

cycle: delete install

delete:
	@kubectl -C context delete