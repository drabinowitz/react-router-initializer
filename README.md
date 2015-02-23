#React-Router-Initializer
>The `React-Router` is almost perfect for building isomorphic apps but it creates chicken and the egg scenarios where we want our stores to have data before we render our components but we don't know what stores we need to load until we render our components. The `React-Router-Initializer` solves this problem by allowing our components to request the necessary data before they are rendered.

##Description
The 'React-Router' supports the 'renderToString' method which means it can be used in isomorphic apps for both server and client side rendering. However, it does result in some chicken-and-the-egg type problems, wherein you need to preload your `stores` with data for your components to render properly, but you don't know what components you will need to render until you render your router.

'Fluxible' and other isomorphic libraries attempt to solve this problem by triggering `navigation` actions before rendering the routes. In response to those actions the `stores` preload themselves with the necessary data for the rendering to occur. Then the route can safely be rendered. However, you can immediately see where things get problematic. Now all of a sudden our `stores` need to understand our routes and need to know way more about our application than we would like. This adds some tight coupling between our stores and our routes that we would ideally avoid.

What would be the perfect solution? If we could somehow trigger our route handlers to request the data they will need before we render, and then render whenever we finish collecting our data. This would allow our `stores` to know absolutely nothing about our routes and encapsulate our routing logic within the `React-Router`.

This is where the `React-Router-Initializer` library comes in to play. This library is designed to be used in tandem with the `React-Router` so that we can `initialize` our route handlers before we render and then render once we finish collecting data.

Let's take a look at an example of how this would work.
