COMMIT := $(shell git rev-parse --short HEAD)
DIRTY := $(shell git diff --shortstat 2>/dev/null | tail -n1)
VERSION := "v0.2.0-dev"

ifeq ($(DIRTY),)
LDFLAGS := -X main.Commit \"$(COMMIT)\"\
           -X main.Version \"$(VERSION)\"
else
LDFLAGS := -X main.Commit \"$(COMMIT)+\"\
           -X main.Version \"$(VERSION)\"
endif

GOOS := $(shell go env GOOS)
GOARCH := $(shell go env GOARCH)

GOSRCS = $(shell find . -name '*.go')

.PHONY: clean build default

default: build

build: bin/twui

bin/twui: $(GOSRCS)
	@go build -ldflags "$(LDFLAGS)" -o $@

clean:
	@rm -rf bin
