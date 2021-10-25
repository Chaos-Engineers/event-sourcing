# Event Sourcing

Event Sourcing Prototype in ES2021 hosted in Rancher's K3D, a tiny K8S distro for development.

---

## System Requirements:
You need to have Docker, K3D, kubectl, okteto, make, jq and helm installed. The following instructions are in the `provision.sh` bash script in the root of the project.

### Docker:
curl -s get.docker.com | sh

### Kubectl:
```
curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
echo 'source <(kubectl completion bash)' >>~/.bashrc
echo 'alias k=kubectl' >>~/.bashrc
echo 'complete -F __start_kubectl k' >>~/.bashrc
```

### K3D:
```
curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | bash
```

### Helm:
```
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

### JQ:
```
sudo apt install -y jq
```

### Make:
```
sudo apt install -y make
```


### Okteto CLI:
```
curl https://get.okteto.com -sSfL | sh
```

## Optional:

### Krew
```
(
  set -x; cd "$(mktemp -d)" &&
  OS="$(uname | tr '[:upper:]' '[:lower:]')" &&
  ARCH="$(uname -m | sed -e 's/x86_64/amd64/' -e 's/\(arm\)\(64\)\?.*/\1\2/' -e 's/aarch64$/arm64/')" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/krew.tar.gz" &&
  tar zxvf krew.tar.gz &&
  KREW=./krew-"${OS}_${ARCH}" &&
  "$KREW" install krew
)

echo 'export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"' >> .bashrc

export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
kubectl krew update
kubectl krew install get-all change-ns ingress-nginx janitor doctor ns pod-dive pod-inspect pod-lens pod-logs pod-shell podevents service-tree sick-pods view-secret
```

### Operator SDK
(assuming you have homebrew or homebrew-linux installed)
brew install operator-sdk
operator-sdk olm install

## Directory Structure
```
├── api
│   └── orders-api
│       ├── db
│       └── orders
├── infra
│   └── cluster
├── platform
│   ├── adaptor
│   ├── ingress
│   └── redis
├── services
│   └── orders
│       └── order
└── ui
    └── ifs-ui
```

* `Infra` contains the k3d cluster 
* `Platform` contains the redis pub/sub bus, the nginx ingress controller, and the event adaptor that takes messages off the bus and passes them to the microservices.
* `api` - public API for the UI
* `services` - business logic invoked by events/adaptor
* `ui` - the UI

The `context` directories contain a yaml file to create the kubernetes context. The `src` directories contain the ES2021 code, and in the case of the ui it also contains react jsx code.

## Makefiles
From the root, run `make up` to bring up the k3d cluster. It currently has only a single node, but that's easy to edit in the infra/cluster/`k3d-config.yaml` file.

```
make up platform services api ui
```
Will bring up the entire application ready for use. Navigate to http://locahost:8080 in your browser to see the UI.