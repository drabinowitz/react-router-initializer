#React-Router-Initializer
>The `react-router` is almost perfect for building isomorphic apps but it creates chicken and the egg scenarios where we want our stores to have data before we render our components but we don't know what stores we need to load until we render our components. The `react-router-initializer` solves this problem by allowing our components to request the necessary data before they are rendered.

##Description
The 'react-router' supports the 'renderToString' method which means it can be used in isomorphic apps for both server and client side rendering. However, it does result in some chicken-and-the-egg type problems, wherein you need to preload your `stores` with data for your components to render properly, but you don't know what components you will need to render until you render your router.

'Fluxible' and other isomorphic libraries attempt to solve this problem by triggering `navigation` actions before rendering the routes. In response to those actions the `stores` preload themselves with the necessary data for the rendering to occur. Then the route can safely be rendered. However, you can immediately see where things get problematic. Now all of a sudden our `stores` need to understand our routes and need to know way more about our application than we would like. This adds some tight coupling between our stores and our routes that we would ideally avoid.

What would be the perfect solution? If we could somehow trigger our route handlers to request the data they will need before we render, and then render whenever we finish collecting our data. This would allow our `stores` to know absolutely nothing about our routes and encapsulate our routing logic within the `react-router`.

This is where the `react-router-initializer` library comes in to play. This library is designed to be used in tandem with the `react-router` so that we can `initialize` our route handlers before we render and then render once we finish collecting data.

Let's take a look at an example of how this would work.

##Example
There are four pieces to the `react-router-initializer`:

1) **the `generateMixin` method**, which is used to add the static react method that the initializer will hook into when executing

```javascript
//MessageOwner.js

var React = require('react');
var messageActions = require('../actions/messageActions');

var getMessagesForRoom = function (routeParams) {
  messageActions.get(routeParams.roomId);
};

var initializerMixin = require('react-router-initializer').generateMixin(getMessagesForRoom);

var MessageOwner = React.createClass({
  mixins: [initializerMixin]

  //work your magic here

});

module.exports = MessageOwner;
```

2) **the `register` method**, which is used by our actions to register their promises so that the initializer can wait for the promises to resolve before triggering the router rendering.

```javascript
//messageActions.js

var messageConstants = require('../constants/messageConstants');
var appDispatcher = require('../dispatcher/appDispatcher');
var initializer = require('react-router-initializer');

//gotta love facebook's fetchr, no more thinking about whether im on the client or server! Let's awesome we Promisified our methods
var fetcher = require('../utils/fetcher');

var messageActions = {
  get: function (roomId) {
    //promisified fetchr read method
    var fetchMessages = fetcher.readAsync('messages', {roomId: roomId}, {});

    //register our promise within our actions to handle data dependencies
    this.fetchMessages = fetchMessages;

    //register our request with the initializer
    initializer.register(fetchMessages.then(function (data, meta) {
      //work your magic here
    }));
  }

  //should probably work some more magic here too

};

module.exports = messageActions;
```

Don't worry about registering when you aren't initializing your router as the `initializer` will only `register` promises during the `execute` method, described below.

3) **the `execute` method**, which is used within the `router.run` method to initialize our routes and then wait for all promises to resolve before proceeding with our rendering.

```javascript
//server.js

var React = require('react');
var reactRouter = require('react-router');
var Routes = require('./components/Routes');
var initializer = require('react-router-initializer');

//need to pass in our state to the execute method
reactRouter.run(function (Handler, state) {

  //any other magic you might need before you render

  initializer.execute(state).then(function () {
    var reactHtml = React.renderToString(React.createElement(Handler));

    //work your magic here

  });
});
```

Those are the three core pieces of the initializer, but it comes packaged with one more tool, which can be useful in specific app architectures.

4) **the `handle` method**, which is designed for large scale applications. Since we are only triggering the route handler components themselves with our default implementation, we are not able to trigger nested components within each route handler. The `handle` method is used here so that a handler can indicate which child components should be initialized along with it. This method supports nesting so each child can then further `handle` its own children

```javascript
//MessageOwner.js

var React = require('react');
var messageActions = require('../actions/messageActions');
var initializer = require('react-router-initializer');
var LikeOwner = require('./LikeOwner');

var getMessagesForRoom = function (routeParams) {
  //trigger our action before we initialize our children
  messageActions.get(routeParams.roomId);
  initializer.handle([LikeOwner]);
};

//work your magic here
```

And then in the `LikeOwner` child component

```javascript
//LikeOwner.js

var React = require('react');
var likeActions = require('../actions/likeActions');
var LikeOwner = require('./LikeOwner');

var getLikesForRoom = function (routeParams) {
  likeActions.get(routeParams.roomId);
};

//lots more magic to work below
```

If we have data dependencies we need to handle (for example we need to fetch likes for every message in the room rather than the room itself, we can do this within our actions)

```javascript
//lkeActions.js

var messageActions = require('./messageActions');
var fetcher = require('../utils/fetcher');
var _ = require('underscore');

var likeActions = {
  get: function () {
    //fetch our messages then fetch our likes when we are done
    var fetchLikes = messageActions.fetchMessages.then(function (data) {
      return fetcher.readAsync('likes', {messageIds: _.pluck(data, 'id')}, {});
    });

    //register our promise within our actions to handle data dependencies
    this.fetchLikes = fetchLikes;

    //register our request with the initializer
    initializer.register(fetchLikes.then(function (data, meta) {
      //work your magic here
    }));
  }

  //should probably work some more magic here too

};
```
