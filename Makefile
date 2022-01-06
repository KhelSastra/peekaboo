COMMON_ARGS := --bundle --format=esm --outfile=assets/bundle.js --target=es6 --external:'https://*' src/main.ts

dev:
	esbuild --watch $(COMMON_ARGS)

build:
	esbuild --minify $(COMMON_ARGS)