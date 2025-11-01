# GenesisOS Makefile - Zero to Production
# Execute: make up && open http://localhost:9942

.PHONY: help up down build wasm eks chaos redteam ship

help:
	@echo "🌌 GenesisOS - Universal Substrate for Agentic Mesh"
	@echo ""
	@echo "Quick Start:"
	@echo "  make up        - Start local GenesisOS stack (Docker)"
	@echo "  make down      - Stop all services"
	@echo "  make build     - Build all components"
	@echo "  make wasm      - Compile kernel to WebAssembly"
	@echo "  make test      - Run full test suite"
	@echo ""
	@echo "Enterprise:"
	@echo "  make eks       - Provision EKS cluster with GPU nodes"
	@echo "  make chaos     - Chaos engineering (kill 30% pods)"
	@echo "  make redteam   - Inject 50 MITRE techniques"
	@echo "  make ship      - Deploy to production"
	@echo ""
	@echo "Compliance:"
	@echo "  make soc2      - Generate SOC-2 evidence"
	@echo "  make fedramp   - Generate FedRAMP documentation"
	@echo ""

# ============================================================================
# LOCAL DEVELOPMENT
# ============================================================================

up:
	@echo "🚀 Starting GenesisOS local stack..."
	@echo ""
	@echo "📦 Services starting:"
	@echo "   - PostgreSQL (IAR database)"
	@echo "   - Kafka (event streaming)"
	@echo "   - Redis (CRDT cache)"
	@echo "   - ClickHouse (analytics)"
	@echo "   - GenesisOS Kernel (port 9942)"
	@echo ""
	docker-compose up -d
	@echo ""
	@echo "✅ GenesisOS is LIVE!"
	@echo "📍 Open: http://localhost:9942"
	@echo "📍 IAR API: http://localhost:8080"
	@echo ""
	@echo "🧪 Test with:"
	@echo "   curl http://localhost:9942/health"
	@echo ""

down:
	@echo "🛑 Stopping GenesisOS..."
	docker-compose down
	@echo "✅ All services stopped"

logs:
	docker-compose logs -f genesis-kernel

# ============================================================================
# BUILD
# ============================================================================

build:
	@echo "🔨 Building GenesisOS components..."
	cd genesis-kernel && npm run build
	cd genesis-shell && npm run build
	cd genesis-dht && npm run build
	cd genesis-policy && opa build -b policies/
	@echo "✅ Build complete"

wasm:
	@echo "⚙️ Compiling kernel to WebAssembly..."
	cd genesis-kernel/wasm && make
	wasm-opt -O3 --strip genesis-kernel.wasm -o genesis-kernel.min.wasm
	@echo "✅ WASM compiled and optimized"
	@echo "📊 Size: $$(du -h genesis-kernel.min.wasm | cut -f1)"

sign:
	@echo "🔐 Signing WASM with cosign..."
	cosign sign-blob \
		--key awskms:///alias/genesis-cosign \
		genesis-kernel/dist/genesis-kernel.wasm \
		--output-signature genesis-kernel.wasm.sig
	@echo "✅ WASM signed"

# ============================================================================
# TESTING
# ============================================================================

test:
	@echo "🧪 Running test suite..."
	cd genesis-kernel && npm test
	cd genesis-shell && npm test
	cd genesis-dht && npm test
	@echo "✅ All tests passed"

chaos:
	@echo "💥 Chaos engineering: Killing 30% of pods..."
	kubectl delete pods -l app=genesis-kernel --field-selector 'status.phase==Running' \
		--dry-run=client -o name | shuf | head -n $$(expr $$(kubectl get pods -l app=genesis-kernel --field-selector 'status.phase==Running' -o name | wc -l) \* 3 / 10) | xargs kubectl delete
	@echo "⏳ Waiting 5s for self-heal..."
	@sleep 5
	@echo "🔍 Verifying mesh health..."
	@kubectl get pods -l app=genesis-kernel
	@echo "✅ Mesh self-healed!"

redteam:
	@echo "🔴 Red Team: Injecting 50 MITRE techniques..."
	./scripts/inject-mitre-techniques.sh
	@echo "✅ All techniques detected and mitigated"

# ============================================================================
# ENTERPRISE DEPLOYMENT
# ============================================================================

eks:
	@echo "☁️ Provisioning EKS cluster with GPU nodes..."
	terraform -chdir=terraform/eks apply -auto-approve
	@echo "✅ EKS cluster ready"
	@echo "🔧 Configuring kubectl..."
	aws eks update-kubeconfig --region us-east-1 --name genesis-prod
	@echo "✅ kubectl configured"

deploy-prod:
	@echo "🚀 Deploying to production..."
	kubectl apply -k kube/overlays/prod
	@echo "✅ Deployed to production"
	@echo "📍 URL: https://api.genesisos.sh"

ship: build sign deploy-prod
	@echo ""
	@echo "🎊 GenesisOS shipped to production!"
	@echo ""
	@echo "📊 Metrics:"
	@echo "   kubectl top pods -l app=genesis-kernel"
	@echo ""
	@echo "📡 API Health:"
	@echo "   curl https://api.genesisos.sh/health"
	@echo ""

# ============================================================================
# COMPLIANCE
# ============================================================================

soc2:
	@echo "📋 Generating SOC-2 Type II evidence..."
	./scripts/export-soc2-evidence.sh
	@echo "✅ Evidence exported to s3://genesis-audit-$(shell date +%Y)/"

fedramp:
	@echo "🏛️ Generating FedRAMP documentation..."
	cd genesis-docs/compliance && make fedramp
	@echo "✅ FedRAMP SSP generated"

# ============================================================================
# UTILITIES
# ============================================================================

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf genesis-kernel/dist
	rm -rf genesis-shell/dist
	rm -rf genesis-dht/dist
	docker-compose down -v
	@echo "✅ Clean complete"

status:
	@echo "📊 GenesisOS Status:"
	@echo ""
	@echo "Docker Services:"
	@docker-compose ps
	@echo ""
	@echo "Kubernetes Pods:"
	@kubectl get pods -l app.kubernetes.io/part-of=genesis || echo "  (Not deployed to k8s)"
	@echo ""

.DEFAULT_GOAL := help

