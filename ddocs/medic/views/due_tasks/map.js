// TODO replace this with medic-sms/messages_by_state
function(doc) {
  if (Array.isArray(doc.scheduled_tasks)) {
    doc.scheduled_tasks.forEach(function(task) {
      if (task.due && task.state === 'scheduled') {
        emit(task.due);
      }
    });
  }
}
