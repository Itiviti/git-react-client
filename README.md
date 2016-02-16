[![Build Status](https://travis-ci.org/Ullink/git-react-client.svg)](https://travis-ci.org/Ullink/git-react-client)

# git-react-client
Frontend to [git bare REST API](https://github.com/Ullink/git-bare-node-rest-api), allows to grep/search through multiple bare repositories

## Install

You first need to get the [REST server](https://github.com/Ullink/git-bare-node-rest-api) setup.

Then update `settings.js` with links to your preferred GIT viewer, update also the link to the above REST endpoint.

And `npm run start` will get you a dev webpack server up and runnig.

## Note

Because of issue [#1122](https://github.com/Reactive-Extensions/RxJS/issues/1122), webpack 2 fails to import rx, and you need (till it gets fixed) to manually modify `node_modules/rx/package.json`, replacing `dist/rx.all.js` by `./dist/rx.all.js`
