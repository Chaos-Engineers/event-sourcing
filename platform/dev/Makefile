.PHONY: build release

build:
	@echo "\033[0;32mBuilding Nodemon Image\033[0m"
	@docker build -t localhost:5000/labs/nodemon .

release:
	@echo "\033[0;32mPushing Nodemon Image\033[0m"
	@docker push localhost:5000/labs/nodemon

gbuild:
	@echo "\033[0;32mBuilding Nodemon Image\033[0m"
	@docker build -t bryandollery/nodemon .

grelease:
	@echo "\033[0;32mPushing Nodemon Image\033[0m"
	@docker push bryandollery/nodemon

