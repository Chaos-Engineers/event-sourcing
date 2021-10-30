.PHONY install delete

install:
	@make -C context install
	@make -C ingress install
	@make -C redis install
	@make -C adaptor install

delete:
	@make -C ingress delete
	@make -C redis delete
	@make -C adaptor delete
	@make -C context delete
