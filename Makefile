.PHONY:  cycle _cycle up down platform default

default: up platform

cycle: _cycle platform

_cycle:
	@make -C infra/cluster cycle

up:
	@make -C infra/cluster up

down:
	@make -C infra/cluster down

platform:
	@make -C platform/context install
	@make -C platform/ingress install
	@make -C platform/redis install
	@make -C platform/adaptor install

api:
	@make -C api/context install
	@make -C api/orders install

services:
	@make -C services install
