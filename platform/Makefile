.PHONY: install delete

install:
	@make -C context install
	@make -C ingress install
	@make -C kafka install
	@make -C event-adaptor install all

delete:
	@make -C ingress delete
	@make -C kafka delete
	@make -C event-adaptor delete
