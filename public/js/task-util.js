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

function stringToLink(s) {
  if(/https?\:\/\//.test(s)) {
    return '<a href="' + s + '">' + s + '</a>'
  }
  return s
}
