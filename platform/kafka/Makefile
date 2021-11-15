.PHONY: install delete install-strimzi install-bus create-topics

install: install-strimzi install-bus create-topics

install-strimzi:
	@echo "\033[0;32mInstalling Strimzi Operator for Kafka\033[0m"
	kubectl create -f 'https://strimzi.io/install/latest?namespace=platform' -n platform

install-bus:
	@echo "\033[0;32mCreate bus and wait until ready\033[0m"
	kubectl apply -f bus.yaml -n platform
	kubectl wait kafka/enterprise-bus --for=condition=Ready --timeout=300s -n platform
	@echo "\033[0;32mEnterprise Bus (kafka) Ready\033[0m"

create-topics:
	@echo "\033[0;32mCreating topics\033[0m"
	kubectl apply -f topic.yaml -n platform

delete:
	@echo "\033[0;32mDeleting Kafka and Strimzi\033[0m"
	kubectl delete -f 'https://strimzi.io/install/latest?namespace=platform' -n platform
