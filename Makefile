MAKE?=make
DOCKER_ID_USER?=markuswa
DOCKER_IMAGE?=demoinfocs-wasm
DOCKER_TAG?=latest
DOCKER_IMAGE_FULL=$(DOCKER_ID_USER)/$(DOCKER_IMAGE):$(DOCKER_TAG)

all: build e2e-tests
build:
	$(MAKE) -C app all
e2e-tests:
	docker-compose build
	docker-compose up --abort-on-container-exit
run:
	$(MAKE) -C app run
publish:
	docker tag $(DOCKER_IMAGE) $(DOCKER_IMAGE_FULL)
	docker push $(DOCKER_IMAGE_FULL)