function prettyDate(d) {
  var year  = d.slice(0,4)
  var month = d.slice(4,6)
  var day   = d.slice(6,8)
  var date = new Date(Date.UTC(year, month, day))
  return date.toLocaleDateString();
}

function stringToLink(s) {
  if(/https?\:\/\//.test(s)) {
    return '<a href="' + s + '">' + s + '</a>'
  }
  return s
}

function buildAnnotationsListing(annotations) {
  output = ''
  if(annotations) {
    if(annotations.length === 1) {
      output += '<tr><td>Annotation</td><td>' + stringToLink(annotations[0].description) + '</td></tr'
    } else {
      var tmp = annotations.map(function (a) {
        return '<td>' + stringToLink(a.description) + '</td>'
      })
      tmp[0] = '<td rowspan="' + tmp.length + '">Annotations</td>' + tmp[0]
      output += tmp.reduce(function (acc, el) {
        return acc + '<tr>' + el + '</tr>'
      }, '')
      tmp = undefined
    }
  }
  return output
}

function taskPropertiesTable (task) {
  var output = ''
  output += '<table class="task-properties">'
  output += '<tr><td>Description</td><td>' + task.description + '</td></tr>'
  if(task.project) { output += '<tr><td>Project</td><td>' + task.project + '</td></tr>' }
  output += '<tr><td>Status</td><td>' + task.status + '</td></tr>'
  output += '<tr><td>Urgency</td><td>' + Math.round(taskUrgency(task)*10000)/10000 + '</td></tr>'
  if(task.priority) { output += '<tr><td>Priority</td><td>' + task.priority + '</td></tr>' }
  output += '<tr><td>Added on</td><td>' + prettyDate(task.entry) + '</td></tr>'
  if(task.due) { output += '<tr><td>Due on</td><td>' + prettyDate(task.due) + '</td></tr>' }
  output += '<tr><td>UUID</td><td>' + task.uuid + '</td></tr>'
  output += buildAnnotationsListing(task.annotations)
  output += '</table>'
  return output
}

function modifyMenu(task) {
  var output = ''
  output += '<ul>'
  output += '<li id="task-done">&#10004;  [done]</li>'
  output += '</ul>'
  return output
}

function removeTaskModifyHandlers() {
  $('#task-done').off('click')
}

function addTaskModifyHandlers(task) {
  $('#task-done').click(function() {
    $.ajax({
      url: '/done',
      type: 'PUT',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify({"uuid": task.uuid}),
      success: function(result) {
        alert(task.description + ' is complete!')
      },
      error: function(err) {
        alert('server fail.')
      }
    })
  })
}

function formatTaskDetail(task) {
  var output = ''
  output += '<h1>' + task.description + '</h1>'
  output += formatIfDefined(task, 'project')
  output += taskTagsToHTML(task.tags)
  output += modifyMenu(task)
  output += taskPropertiesTable(task)
  return output
}

function deactivateTask(taskid) {
  $('#' + taskid).removeClass('active')
}

function activateTask(task) {
  deactivateTask(currentTask.uuid)
  removeTaskModifyHandlers()
  $('#task-detail').html(formatTaskDetail(task))
  $('#' + task.uuid).addClass('active')
  addTaskModifyHandlers(task)
  currentTask = task
}

var theTasks = []
var currentTask

function removeClickHandlers() {
  $('.task').each(function () {
    $(this).off('click')
  })
}

function attachClickHandlers(taskList) {
  taskList.forEach(function (t) {
    $('#' + t.uuid).click(function() {
      activateTask(t)
    })
  })
}

function fetchData() {
  $.get("/tasks", function (data) {
    theTasks = data.filter(taskNotDone).sort(function(a, b) {
      return taskUrgency(b) - taskUrgency(a)
    })

    currentTask = theTasks[0]
    $('#task-list').html(theTasks.map(taskJsonToHTML))
    attachClickHandlers(theTasks)
    activateTask(currentTask)
  })
}

$(document).ready( function () {
  fetchData()
  $('#refresh-button').click(function() {
    removeClickHandlers()
    $.get("/refresh")
    fetchData()
  })
});
