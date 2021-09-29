default: dev

dev:
	@docker build -t bryandollery/order -f Dockerfile_dev .

run:
	@docker run -it --rm -p 8080:80 bryandollery/order

cycle: delete install
install: build release deploy

build:
	@echo "\033[0;32mBuilding order\033[0m"
	@docker build -t bryandollery/order .

release:
	@echo "\033[0;32mPushing order\033[0m"
	@docker push bryandollery/order

deploy:
	@kubectl apply -f order.yaml
	@echo "\033[0;32mWaiting for order pod to be ready\033[0m"
	@kubectl wait $$(kubectl get pods -o name -n contexts-order | grep order) --for=condition=ready --timeout=30s -n contexts-order

delete:
	@kubectl delete -f order.yaml