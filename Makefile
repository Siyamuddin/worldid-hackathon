.PHONY: help build up down restart logs clean

help:
	@echo "Available commands:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start all services (production)"
	@echo "  make dev        - Start all services (development)"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs from all services"
	@echo "  make clean      - Remove containers, volumes, and images"
	@echo "  make db-shell   - Open PostgreSQL shell"

build:
	docker-compose build

up:
	docker-compose up -d

dev:
	docker-compose -f docker-compose.dev.yml up

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

db-shell:
	docker-compose exec db psql -U postgres -d worldid_rewards

backend-shell:
	docker-compose exec backend bash

frontend-shell:
	docker-compose exec frontend sh
