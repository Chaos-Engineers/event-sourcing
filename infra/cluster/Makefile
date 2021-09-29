.PHONY: default down up cycle

default: up

cycle: down up

up:
	@k3d cluster create lab --config k3d-config.yaml
	@kubectl taint node k3d-lab-server-0 k3s-controlplane=true:NoSchedule

down:
	@k3d cluster delete lab

