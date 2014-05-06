function taskTagsToHTML(tags) {
  if (!tags || tags.length === 0) { return '' }
  var formattedTags = tags.map(function(tag) { return '<span class="tag">' + tag + '</span>' }).join('\n')
  return '<span class="group tag-list">' + formattedTags + '</span>'
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
  next: 15.0,
  due: 12.0,
  blocking: 8.0,
  priority: 6.0,
  active: 4.0,
  scheduled: 4.0,
  age: 2.0,
  annotations: 1.0,
  tags: 1.0,
  project: 1.0,
  blocked: -5.0,
  waiting: -3.0,
}

function taskTimeParse(t) {
  return Date.UTC(parseInt(t.slice(0,4)),
                  parseInt(t.slice(4,6)),
                  parseInt(t.slice(6,8)),
                  parseInt(t.slice(9,11)),
                  parseInt(t.slice(11,13)),
                  parseInt(t.slice(13,15)))
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

  if(task.tags) {
    urgency += task.tags.length * coefficients.tags
  }

  if(task.project) {
    urgency += coefficients.project
  }

  if(task.status === 'waiting') {
    urgency += coefficients.waiting
  }

  urgency += (Date.now() - taskTimeParse(task.entry))/10000000000.0*coefficients.age

  if(task.due) {
    if(Date.now() - taskTimeParse(task.due) < 604800000) {
      urgency += coefficients.due
    }
  }

  return urgency
}

function prettyDate(d) {
  var year  = d.slice(0,4)
  var month = d.slice(4,6)
  var day   = d.slice(6,8)
  var date = new Date(Date.UTC(year, month, day))
  return date.toLocaleDateString();
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
  if(task.annotations) {
    if(task.annotations.length === 1) {
      output += '<tr><td>Annotation</td><td>' + task.annotations[0].description + '</td></tr'
    } else {
      var tmp = task.annotations.map(function (a) {
        return '<td>' + a.description + '</td>'
      })
      tmp[0] = '<td rowspan="' + tmp.length + '">Annotations</td>' + tmp[0]
      output += tmp.reduce(function (acc, el) {
        return acc + '<tr>' + el + '</tr>'
      }, '')
      tmp = undefined
    }
  }
  output += '</table>'
  return output
}

function formatTaskDetail(task) {
  var output = ''
  output += '<h1>' + task.description + '</h1>'
  output += formatIfDefined(task, 'project')
  output += taskTagsToHTML(task.tags)
  output += taskPropertiesTable(task)
  return output
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
