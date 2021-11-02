.PHONY: install delete

install:
	@make -C context install
	@make -C ingress install
	@make -C redis install
	@make -C event-adaptor install all

delete:
	@make -C ingress delete
	@make -C redis delete
	@make -C event-adaptor delete
