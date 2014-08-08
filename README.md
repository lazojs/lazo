<h1>
  lazojs
  <a title='Build Status' href="https://travis-ci.org/walmartlabs/lazojs">
    <img src='https://travis-ci.org/walmartlabs/lazojs.svg' />
  </a>
</h1>
<p align="center">
  <img title="lazojs" src='lazojs.png?raw=true' /><br />
</p>

Lazojs is a client-server web framework built on Node.js that allows front-end developers to easily create a
100% SEO compliant, component MVC structured web application with an optimized first page
load using a familiar tool stack comprised of [Backbone.js](http://backbonejs.org/),
[RequireJS](http://requirejs.org/), and [jQuery](http://jquery.com/).

Have a question? Want to keep up-to-date on changes and releases? Post questions to the [LazoJS Google Group](https://groups.google.com/forum/#!forum/lazojs) and follow [@lazojs](https://twitter.com/lazojs) on Twitter.

### Problem
The single page application ([SPA](http://en.wikipedia.org/wiki/Single-page_application)) model is an excellent
approach for separating application logic from data retrieval; consolidating UI code to a single language and run
time; and delegating rendering to browsers. However, the SPA model fails to adequately address SEO concerns and
time to first page render making it a major concern for any public facing website. As such, developers rely on
work-arounds such as the hashbang hack or running the DOM on the server so they can realize the benefits of the
SPA model and address SEO concerns. These work-arounds, however, have significant performance and maintenance drawbacks.

### Solution
Lazo was created by WalmartLabs to address these issues and provide front-end engineers with a familiar environment for
creating web applications. Pages are constructed via reusable, nestable components that have their own life cycles
allowing developers to easily create complex views while providing excellent encapsulation and separation of concerns.
These pages are mapped to fully qualified, SEO compliant URIs. Lazo renders the first page load on the server via a
rendering engine that uses string concatenation. Subsequent page requests are rendered by browsers that support HTML5's
[pushstate](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history) capability. For those
browsers that do not support pushstate, Lazo falls back to rendering views on the server. This approach allows developers to
reap the SEO benefits of the traditional web application model, while still working in a context with which they are
familiar, and realizing all SPA model benefits without coding for them.

[**Learn More**](https://github.com/walmartlabs/lazojs/wiki/Overview)

## Getting Started
Lazo is a [node module](https://npmjs.org/). Installing and creating a new Lazo application is as easy as uno, dos, tres.

### Installation and Application Creation

To install Lazo execute the following command:

```shell
npm install -g --production lazo
```

Next clone [Lazo TodoMVC example](https://github.com/jstrimpel/lazojs-todomvc):

```shell
git clone git@github.com:jstrimpel/lazojs-todomvc.git
```

Finally start the new application:

```shell
lazo start lazojs-todomvc
```

You are done.

Open `http://localhost:8080` in a browser to verify that the application is running.
