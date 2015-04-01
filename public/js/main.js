(function(window, document, undefined) {
  var routes = {}
  function route(path, templateId, controller) {
    routes[path] = {templateId: templateId, controller: controller};
  }

  var tasks = {}

  route('/', 'home', function(){
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("error", function() {
      console.log("failed to fetch tasks")
    }, false);
    xhr.addEventListener("load", function(){
      try {
        var data = JSON.parse(xhr.responseText);
        data.sort(function(a,b) {
          if (a.urgency < b.urgency) {
            return 1;
          } else if (a.urgency > b.urgency) {
            return -1;
          }
          return 0;
        })
        tasks = data
      } catch(e) {
        alert(e)
        return
      }
      console.log(data);
      var container = document.createElement('div')
      for(var i = 0, l = tasks.length; i < l; i++) {
        var task = tasks[i]
        if (task.status === 'deleted' || task.status === 'completed') {
          continue
        }
        container.innerHTML += tmpl("taskListEntry", new function(){
          this.task = task;
        }())
      }
      el = document.getElementById('view')
      if(el) {
        el.appendChild(container)
      }
    }, false);
    xhr.open("GET", "/tasks", true);
    xhr.send();
  });
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
