.PHONY: install delete

install:
	@make -C context install
	@make -C ingress install
	@make -C redis install
	@make -C adaptor build release redis-secret

delete:
	@make -C ingress delete
	@make -C redis delete
	@make -C adaptor delete
