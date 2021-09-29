# Details

Date : 2021-09-29 17:48:14

Directory /home/bryan/git/codification/event-sourcing

Total : 49 files,  1670 codes, 20 comments, 156 blanks, all 1846 lines

[summary](results.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [Makefile](/Makefile) | Make | 19 | 0 | 9 | 28 |
| [api/context/Makefile](/api/context/Makefile) | Make | 4 | 0 | 1 | 5 |
| [api/context/api.yaml](/api/context/api.yaml) | YAML | 4 | 0 | 1 | 5 |
| [api/orders/.dockerignore](/api/orders/.dockerignore) | Ignore | 1 | 0 | 0 | 1 |
| [api/orders/Dockerfile](/api/orders/Dockerfile) | docker | 6 | 0 | 2 | 8 |
| [api/orders/Dockerfile_dev](/api/orders/Dockerfile_dev) | docker | 5 | 0 | 1 | 6 |
| [api/orders/Makefile](/api/orders/Makefile) | Make | 35 | 0 | 17 | 52 |
| [api/orders/db/Makefile](/api/orders/db/Makefile) | Make | 6 | 0 | 2 | 8 |
| [api/orders/orders.yaml](/api/orders/orders.yaml) | YAML | 81 | 0 | 1 | 82 |
| [api/orders/package.json](/api/orders/package.json) | JSON | 18 | 0 | 0 | 18 |
| [api/orders/src/index.js](/api/orders/src/index.js) | JavaScript | 76 | 0 | 13 | 89 |
| [infra/cluster/Makefile](/infra/cluster/Makefile) | Make | 8 | 0 | 6 | 14 |
| [infra/cluster/k3d-config.yaml](/infra/cluster/k3d-config.yaml) | YAML | 37 | 1 | 1 | 39 |
| [platform/Makefile](/platform/Makefile) | Make | 10 | 0 | 1 | 11 |
| [platform/adaptor/.dockerignore](/platform/adaptor/.dockerignore) | Ignore | 1 | 0 | 0 | 1 |
| [platform/adaptor/Dockerfile](/platform/adaptor/Dockerfile) | docker | 6 | 0 | 1 | 7 |
| [platform/adaptor/Dockerfile_dev](/platform/adaptor/Dockerfile_dev) | docker | 5 | 0 | 1 | 6 |
| [platform/adaptor/Makefile](/platform/adaptor/Makefile) | Make | 23 | 0 | 9 | 32 |
| [platform/adaptor/adaptor.yaml](/platform/adaptor/adaptor.yaml) | YAML | 84 | 0 | 1 | 85 |
| [platform/adaptor/package.json](/platform/adaptor/package.json) | JSON | 19 | 0 | 0 | 19 |
| [platform/adaptor/registry/event-consumedby-service.properties](/platform/adaptor/registry/event-consumedby-service.properties) | Properties | 13 | 0 | 0 | 13 |
| [platform/adaptor/registry/service-emits-event.properties](/platform/adaptor/registry/service-emits-event.properties) | Properties | 5 | 0 | 0 | 5 |
| [platform/adaptor/src/index.js](/platform/adaptor/src/index.js) | JavaScript | 89 | 0 | 17 | 106 |
| [platform/context/Makefile](/platform/context/Makefile) | Make | 5 | 0 | 1 | 6 |
| [platform/context/platform.yaml](/platform/context/platform.yaml) | YAML | 4 | 0 | 1 | 5 |
| [platform/ingress/Makefile](/platform/ingress/Makefile) | Make | 7 | 0 | 3 | 10 |
| [platform/ingress/nginx.yaml](/platform/ingress/nginx.yaml) | YAML | 634 | 19 | 2 | 655 |
| [platform/redis/Makefile](/platform/redis/Makefile) | Make | 6 | 0 | 5 | 11 |
| [services/orders/Makefile](/services/orders/Makefile) | Make | 7 | 0 | 3 | 10 |
| [services/orders/context/Makefile](/services/orders/context/Makefile) | Make | 4 | 0 | 1 | 5 |
| [services/orders/context/orders.yaml](/services/orders/context/orders.yaml) | YAML | 4 | 0 | 1 | 5 |
| [services/orders/order/.dockerignore](/services/orders/order/.dockerignore) | Ignore | 1 | 0 | 0 | 1 |
| [services/orders/order/Dockerfile](/services/orders/order/Dockerfile) | docker | 6 | 0 | 2 | 8 |
| [services/orders/order/Dockerfile_dev](/services/orders/order/Dockerfile_dev) | docker | 5 | 0 | 1 | 6 |
| [services/orders/order/Makefile](/services/orders/order/Makefile) | Make | 19 | 0 | 7 | 26 |
| [services/orders/order/order.yaml](/services/orders/order/order.yaml) | YAML | 37 | 0 | 1 | 38 |
| [services/orders/order/package.json](/services/orders/order/package.json) | JSON | 16 | 0 | 1 | 17 |
| [services/orders/order/src/index.js](/services/orders/order/src/index.js) | JavaScript | 53 | 0 | 14 | 67 |
| [ui/ifs-ui/.dockerignore](/ui/ifs-ui/.dockerignore) | Ignore | 1 | 0 | 0 | 1 |
| [ui/ifs-ui/Dockerfile](/ui/ifs-ui/Dockerfile) | docker | 6 | 0 | 2 | 8 |
| [ui/ifs-ui/Makefile](/ui/ifs-ui/Makefile) | Make | 24 | 0 | 11 | 35 |
| [ui/ifs-ui/adaptor.yaml](/ui/ifs-ui/adaptor.yaml) | YAML | 115 | 0 | 1 | 116 |
| [ui/ifs-ui/package.json](/ui/ifs-ui/package.json) | JSON | 30 | 0 | 1 | 31 |
| [ui/ifs-ui/public/index.html](/ui/ifs-ui/public/index.html) | html | 40 | 0 | 4 | 44 |
| [ui/ifs-ui/public/manifest.json](/ui/ifs-ui/public/manifest.json) | JSON | 25 | 0 | 1 | 26 |
| [ui/ifs-ui/src/Orders.jsx](/ui/ifs-ui/src/Orders.jsx) | JavaScript | 42 | 0 | 6 | 48 |
| [ui/ifs-ui/src/index.css](/ui/ifs-ui/src/index.css) | css | 12 | 0 | 2 | 14 |
| [ui/ifs-ui/src/index.js](/ui/ifs-ui/src/index.js) | JavaScript | 11 | 0 | 1 | 12 |
| [ui/ifs-ui/src/logo.svg](/ui/ifs-ui/src/logo.svg) | SVG | 1 | 0 | 0 | 1 |

[summary](results.md)