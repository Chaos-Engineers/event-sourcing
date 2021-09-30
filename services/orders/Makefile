.PHONY: install delete cycle

cycle: delete install

install:
	@make -C context install
	@make -C order install

delete:
	@make -C context delete