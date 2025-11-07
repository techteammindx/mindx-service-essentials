mkdir -p ./src/contract/infra

npx protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_opt=nestJs=true,returnObservable=false,fileSuffix=.grpc.infra.contract \
  --ts_proto_out=./src/contract/infra/ \
  --proto_path=./src/infra/grpc/proto/ ./src/infra/grpc/proto/*.proto

