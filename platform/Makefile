install:
	@make -C platform/context install
	@make -C platform/ingress install
	@make -C platform/redis install
	@make -C platform/adaptor install

delete:
	@make -C platform/ingress delete
	@make -C platform/redis delete
	@make -C platform/adaptor delete
	@make -C platform/context delete