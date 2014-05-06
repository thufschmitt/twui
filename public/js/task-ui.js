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

function processJsonFeed(data) {
  return data.filter(taskNotDone)
             .map(taskJsonToHTML)
}

$(document).ready( function () {
  $.get("/tasks", function (data) {
    $('#task-list').html(processJsonFeed(data))
  })
});
