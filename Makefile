.PHONY:  cycle _cycle infra down platform default services api ui

all: infra platform services api

default: up platform

cycle: _cycle platform

_cycle:
	@make -C infra/cluster cycle

infra:
	@make -C infra/cluster up

down:
	@make -C infra/cluster down

platform:
	@make -C platform install

services:
	@make -C services/orders install

api:
	@make -C api/context install
	@make -C api/orders-api install

ui:
	@make -C ui/context install
	@make -C ui/ui install
	
lsi:
	@curl -s http://localhost:5000/v2/_catalog | jq '.repositories'
