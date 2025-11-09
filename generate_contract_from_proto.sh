npx protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./src/contract/infra \
  --ts_proto_opt=nestJs=true,fileSuffix=.grpc.infra.contract \
  --proto_path=./src/infra/grpc/proto ./src/infra/grpc/proto/*.proto

