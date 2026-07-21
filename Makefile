MOBILE := apps/mobile

.DEFAULT_GOAL := help
.PHONY: help install dev test typecheck start start-usb start-tunnel adb-reverse android run-device prebuild build-website

help: ## List targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install deps (root, mobile, website)
	npm run install:all

dev: ## Run mobile web + website together
	npm run dev

test: ## Run mobile jest suite
	cd $(MOBILE) && npm test

typecheck: ## Typecheck mobile (tsc --noEmit)
	cd $(MOBILE) && npm run typecheck

start: ## Metro dev server
	cd $(MOBILE) && npm start

start-usb: ## Metro on localhost (USB device)
	cd $(MOBILE) && npm run start:usb

start-tunnel: ## Metro over tunnel (Wi-Fi/remote)
	cd $(MOBILE) && npm run start:tunnel

adb-reverse: ## Forward Metro port to USB device
	cd $(MOBILE) && npm run adb:reverse

android: ## Build + install dev client on USB device (no bundler)
	cd $(MOBILE) && npm run android:device

run-device: android adb-reverse start-usb ## One-shot: build+install, forward port, start Metro (USB device)

prebuild: ## Regenerate native android/ (only when native deps change)
	cd $(MOBILE) && npm run prebuild

build-website: ## Build the website
	npm run build:website
