var taskApp = angular.module('taskApp', [])
taskApp.controller('TaskCtrl', function($scope, $http){
  $scope.urgency = function(task) {
    return taskUrgency(task);
  }
  $scope.taskNotDone = function(task) {
    return taskNotDone(task)
  }
  $http.get('/tasks').success(function (data) {
    $scope.tasks = data
  });
  $http.get('/projects').success(function (data) {
    $scope.projects = data
  });
  $scope.refreshTasks = function() {
    $http.put('/tasks')
    setTimeout(function () {
      $http.get('/tasks').success(function (data) { $scope.tasks = data });
      $http.get('/projects').success(function (data) { $scope.projects = data });
    }, 1000)
  }
  $scope.toggleCurrent = function(t) {
    if($scope.current === t) {
      $scope.current = undefined
      $scope.modify = false
      $scope.annotate = false
    } else {
      $scope.current = t
    }
  }
  $scope.toggleModify = function() {
    $scope.modify = !$scope.modify
  }
  $scope.toggleAnnotate = function() {
    $scope.annotate = !$scope.annotate
  }
  $scope.$watch("current", function() {
    var child = document.getElementById('task-list').firstElementChild
    while(child) {
      child.classList.remove('active')
      child = child.nextElementSibling
    }

    if($scope.current) {
      document.getElementById($scope.current.uuid).classList.add('active')
    }
  }, true);
  $scope.prettyDate = function(d) {
    var year  = d.slice(0,4)
    var month = d.slice(4,6)
    var day   = d.slice(6,8)
    var date = new Date(Date.UTC(year, month, day))
    return date.toLocaleDateString();
  }
  $scope.finishTask = function(task) {
    $http.post('/tasks/' + task.uuid,
           { headers: {"Content-Type": "application/json; charset=UTF-8"}}
    ).success( function() {
      $scope.current = undefined
      $scope.refreshTasks()
    })
  }
  $scope.deleteTask = function(task) {
    $http.delete('/tasks/' + task.uuid,
                 { headers: {"Content-Type": "application/json; charset=UTF-8"}}
    ).success( function() {
      console.log("Delete Successful")
      $scope.current = undefined
      $scope.refreshTasks()
    }).error( function(data, status) {
      console.log("Delete Failed", data, status)
    })
  }
  $scope.modifyTask = function() {
    if($scope.current.description) {
      var submissionData = {
        description: $scope.current.description,
        project:     $scope.current.project,
        priority:    $scope.current.priority
      }
      $http.put('/tasks/' + $scope.current.uuid,
        JSON.stringify(submissionData),
        { headers: {"Content-Type": "application/json; charset=UTF-8"}}
      ).success( function() {
        console.log('SUCCESS!')
        $scope.toggleModify()
        $scope.refreshTasks()
      })
    } else {
      document.getElementById('new-description').classList.add('error')
    }
  }
  $scope.newAnnotation = {}
  $scope.annotateTask = function() {
    console.log($scope.newAnnotation.description)
    if($scope.newAnnotation.description) {
      $http.post('tasks/' + $scope.current.uuid + '/annotate',
        JSON.stringify({"annotation": $scope.newAnnotation.description}),
        { headers: {"Content-Type": "application/json; charset=UTF-8"}}
      ).success( function() {
        console.log('Annotation Successful')
        $scope.annotate = false
        $scope.newAnnotation = {}
        $scope.refreshTasks()
      })
    }
  }
  $scope.newtask = {}
  $scope.addTask = function() {
    if($scope.newtask.description) {
      var submissionData = {
        description: $scope.newtask.description,
        project:     $scope.newtask.project,
        priority:    $scope.newtask.priority
      }
      $http.post('/tasks',
          JSON.stringify(submissionData),
          { headers: {"Content-Type": "application/json; charset=UTF-8"}}
      ).success( function() {
        $scope.newtask = {}
        $scope.refreshTasks()
      })
    } else {
      document.getElementById('new-description').classList.add('error')
    }
  }
  $scope.$watch('newtask.description', function() {
    if($scope.newtask.description) {
      document.getElementById('new-description').classList.remove('error')
    }
  })
  $scope.undo = function() {
    $http.post('/undo',
        { headers: {"Content-Type": "application/json; charset=UTF-8"}}
    ).success( function() {
      $scope.refreshTasks()
      $scope.current = undefined
      $scope.newtask = {}
    })
  }
});
