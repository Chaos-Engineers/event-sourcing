.PHONY: cycle install dev run build release redis-secret deploy delete logs

cycle: delete install
install: build release deploy

dev:
	@docker build -t bryandollery/ifsui -f Dockerfile_dev .

run:
	@docker run -it --rm -p 8080:80 bryandollery/ifsui


build:
	@echo "\033[0;32mBuilding ifsui ui\033[0m"
	@docker build -t bryandollery/ifsui .

release:
	@echo "\033[0;32mReleasing ifsui ui\033[0m"
	@docker push bryandollery/ifsui

deploy:
	@echo "\033[0;32mDeploying ifsui ui\033[0m"
	@kubectl apply -f ifsui.yaml
	@echo "\033[0;32mWaiting for ifsui ui pod to be ready\033[0m"


delete:
	@kubectl delete -f ifsui.yaml

logs:
	kubectl logs -n ui $$(kubectl get pods -n ui -o name | grep -i ifsui | head -n 1 | cut -d'/' -f2)
