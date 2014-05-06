function taskTagsToHTML(tags) {
  if (!tags || tags.length === 0) { return '' }
  var formattedTags = tags.map(function(tag) { return '<span class="tag">' + tag + '</span>' }).join('\n')
  return '<span class="tag-list">' + formattedTags + '</span>'
}

function formatIfDefined(task, field) {
  if(!task[field]) { return '' }
  return '<span class="' + field + '">' + task[field] + '</span>\n'
}

function taskPriorityToClass(priority) {
  var output = ' '
    switch(priority){
      case 'H':
        output += 'high'
        break
      case 'M':
        output += 'medium'
        break
      case 'L':
        output += 'low'
        break
      default:
        output = ''
    }
  return output
}

function taskJsonToHTML(task) {
  var output = ''
  output += '<div class="task group'
  output += taskPriorityToClass(task.priority)
  output += '" id="'
  output += task.uuid
  output += '">'
  output += formatIfDefined(task, 'project')
  output += formatIfDefined(task, 'description')
  output += taskTagsToHTML(task.tags)
  output += '</div>\n'
  return output
}

function taskNotDone(task) {
  if(task.status === 'deleted' || task.status == 'completed') {
    return false
  }
  return true
}

var coefficients = {
  priority: 6.0
}

function taskUrgency(task) {
  var urgency = 0.0
  switch(task.priority) {
    case 'H':
      urgency += coefficients.priority
    case 'M':
      urgency += coefficients.priority
    case 'L':
      urgency += coefficients.priority
  }

  return urgency
}

function formatTaskDetail(task) {
  return '<h1>' + task.description + '</h1>'
}

function deactivateTask(taskid) {
  $('#' + taskid).removeClass('active')
}

function activateTask(task) {
  deactivateTask(currentTask.uuid)
  $('#task-detail').html(formatTaskDetail(task))
  $('#' + task.uuid).addClass('active')
  currentTask = task
}

var theTasks = []
var currentTask

$(document).ready( function () {
  $.get("/tasks", function (data) {
    theTasks = data.filter(taskNotDone).sort(function(a, b) {
      return taskUrgency(b) - taskUrgency(a)
    })

    currentTask = theTasks[0]
    $('#task-list').html(theTasks.map(taskJsonToHTML))
    theTasks.forEach(function (t) {
      $('#' + t.uuid).click(function() {
        activateTask(t)
      })
    })
    activateTask(currentTask)
  })
});
