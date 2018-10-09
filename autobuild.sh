#!/bin/sh

if [ -f "./_config.js" ]; then
  cp -f ./_config.js ./src/config.js
fi

if [ -f "./_plugin.scss" ]; then
  cp -f ./_plugin.scss ./src/plugin.scss
fi

rm -f ./public/content.json
node ./buildContent.js

cp -f ./webpack.config.dev.js ./node_modules/react-scripts/config/webpack.config.dev.js
cp -f ./webpack.config.prod.js ./node_modules/react-scripts/config/webpack.config.prod.js

yarn build

echo "Build Complete!"
