.PHONY: default kcycle kup kdown redis adaptor acycle up

default: kup

up: kup redis adaptor

kcycle:
	@make -C cluster cycle
	@make -C ingress up

kup:
	@make -C cluster up
	@make -C ingress up

kdown:
	@make -C cluster down

redis: 
	@make -C redis up

acycle: 
	@make -C adaptor cycle

adaptor:
	@make -C adaptor adaptor
