.PHONY: cycle install dev run build release redis-secret deploy delete logs

cycle: delete install
install: build release deploy

dev:
	@docker build -t localhost:5000/labs/ui -f Dockerfile_dev .

run:
	@docker run -it --rm -p 8080:80 localhost:5000/labs/ui

build:
	@echo "\033[0;32mBuilding iui ui\033[0m"
	@docker build -t localhost:5000/labs/ui .

release:
	@echo "\033[0;32mReleasing ui ui\033[0m"
	@docker push localhost:5000/labs/ui

deploy:
	@echo "\033[0;32mDeploying ui ui\033[0m"
	@kubectl apply -f ui.yaml
	@echo "\033[0;32mWaiting for ui ui pod to be ready\033[0m"

delete:
	@kubectl delete -f ui.yaml

logs:
	kubectl logs -n ui $$(kubectl get pods -n ui -o name | grep -i ui | head -n 1 | cut -d'/' -f2)
