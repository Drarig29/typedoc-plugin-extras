npm run build

mkdir -f ./node_modules/typedoc-plugin-extras/dist
cp package.json ./node_modules/typedoc-plugin-extras/
cp ./dist/* ./node_modules/typedoc-plugin-extras/dist/

npm start