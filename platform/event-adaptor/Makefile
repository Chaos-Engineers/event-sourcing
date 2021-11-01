.PHONY: build release

build:
	@echo "\033[0;32mBuilding event-adaptor\033[0m"
	@docker build -t localhost:5000/labs/event-adaptor .

release:
	@echo "\033[0;32mPushing event-adaptor\033[0m"
	@docker push localhost:5000/labs/event-adaptor
