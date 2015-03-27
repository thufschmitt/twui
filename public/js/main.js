(function(window, document, undefined) {
  var routes = {}
  function route(path, templateId, controller) {
    routes[path] = {templateId: templateId, controller: controller};
  }

  route('/', 'home', function(){})
  route('/page1', 'template1', function(){
    this.greeting = 'Hello world!';
    this.moreText = 'Bacon ipsum...';
  });
  route('/page2', 'template2', function(){
    this.heading = 'I\'m page two!';
  });

  var el = null;
  function router() {
    el = el || document.getElementById('view')
    var url = location.hash.slice(1) || '/'
    var route = routes[url]
    if (el && route.controller) {
      el.innerHTML = tmpl(route.templateId, new route.controller())
    }
  }

  window.addEventListener('hashchange', router)
  window.addEventListener('load', router)
}(window, document));
