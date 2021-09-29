.PHONY:  install delete

install:
	kubectl apply -f nginx.yaml
	@echo "\033[0;32mWaiting for nginx controller pod to be ready\033[0m"
	kubectl wait $$(kubectl get pods -o name -n ingress-nginx | grep controller) --for=condition=ready --timeout=240s -n ingress-nginx

delete:
	kubectl delete -f nginx.yaml
