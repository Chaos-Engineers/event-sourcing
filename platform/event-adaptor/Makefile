.PHONY: all build release install deploy delete

ver := 1.0.5
all: build release deploy

build:
	@echo "\033[0;32mBuilding event-adaptor:$(ver)\033[0m"
	@docker build -t localhost:5000/labs/event-adaptor:$(ver) .

release:
	@echo "\033[0;32mPushing event-adaptor:$(ver)\033[0m"
	@docker push localhost:5000/labs/event-adaptor:$(ver)

install:
	@echo "\033[0;32mInstalling openkruise and configuring adaptor sidecar\033[0m"
	@helm repo add openkruise https://openkruise.github.io/charts/
	@helm repo update
	@helm install kruise openkruise/kruise

deploy:
	@kubectl apply -f event-adaptor.yaml

delete:
	@kubectl delete -f event-adaptor.yaml