#!/bin/sh

rm -f ./public/content.json
node ./buildContent.js

cp -f ./webpack.config.dev.js ./node_modules/react-scripts/config/webpack.config.dev.js
cp -f ./webpack.config.prod.js ./node_modules/react-scripts/config/webpack.config.prod.js

yarn build

echo "Build Complete!"
