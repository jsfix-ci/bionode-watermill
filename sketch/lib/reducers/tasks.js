'use strict'

// Reducers - this implies there is reducer proxying in this reducer
// const taskReducer = require('./task.js')
const { defaultTask } = require('../constants/default-task-state.js')
const config = require('../constants/default-config-state.js')

// Actions
const CREATE_TASK = 'tasks/create'
const START_RESOLVE_INPUT = 'task/start_resolve-input'
const SUCCESS_RESOLVE_INPUT = 'task/success_resolve-input'

const START_OPERATION = 'task/start_operation'
const SUCCESS_OPERATION = 'task/success_operation'

const START_RESOLVE_OUTPUT = 'task/start_resolve-output'
const SUCCESS_RESOLVE_OUTPUT = 'task/success_resolve-output'

const START_VALIDATING_OUTPUT = 'task/start_validating-output'
const SUCCESS_VALIDATING_OUTPUT = 'task/success_validating-output'

// Internal Methods

/**
 * updateTask
 * Return a new state with a new task.
 * @param state {Object} reference to current state
 * @param task {Object} the task to add/update into state. Must have `task.uid`.
 */
const updateTask = (state, task) => {
  const { uid } = task

  if (!uid) {
    throw new Error('Cannot updateTask without a uid')
    return state
  }

  return Object.assign({}, state, { [uid]:task })
}

const taskReducer = (state = {}, action) => {
  switch (action.type) {
    case START_RESOLVE_INPUT:
      return Object.assign({}, state, { status: 'RESOLVING_INPUT' })
      break
    case SUCCESS_RESOLVE_INPUT:
      return Object.assign({}, state, { resolvedInput: action.resolvedInput })
    case START_OPERATION:
      return Object.assign({}, state, { status: 'RUNNING_OPERATION' })
      break
    case START_RESOLVE_OUTPUT:
      return Object.assign({}, state, { status: 'RESOLVING_OUTPUT' })
      break
    case SUCCESS_RESOLVE_OUTPUT:
      return Object.assign({}, state, { resolvedOutput: action.resolvedOutput })
    case START_VALIDATING_OUTPUT:
      return Object.assign({}, state, { status: 'VALIDATING_OUTPUT' })
      break
    case SUCCESS_VALIDATING_OUTPUT:
      return Object.assign({}, state, { validated: true })
      break
    default:
      return state
  }
}

// The `tasks` store item is an object keyed by `task` uids. Each uid points to
// a `task` instance, which also contains `task.uid` for  redundancy. Thus, the
// default state is no tasks.
const defaultState = {}

const reducer = (state = defaultState, action) => {
  const { uid, type } = action

  if (type.startsWith('task/')) {
    // An action has been dispatched for an *assumed existing* task.
    // Proxy the task reducer behind this one.

    // Get the action uid so we can retrieve the current state of that task.
    // If it is not provided, throw and return current state.
    // TODO test case for this
    const { uid } = action
    if (!uid) {
      console.log(action)
      throw new Error('task action not provided with uid')
      return state
    }

    // Use uid to retrieve current task. Throw and return if it is not found.
    // TODO test case for this
    const currentTask = state[uid]
    if (!currentTask) {
      throw new Error('task uid does not match an existing task')
      return state
    }

    // Call taskReducer with current state of corresponding task. This is the
    // point of proxying.
    const newTask = taskReducer(currentTask, action)

    return updateTask(state, newTask)
  }

  switch(type) {
    case CREATE_TASK:
      const { hashes, props } = action

      return updateTask(state, Object.assign(
        defaultTask,
        props,
        { uid, hashes },
        { dir: config.workdir },
        { created: Date.now() }
      ))
    default:
      return state
  }
}

const wrapWithType = (type, obj) => Object.assign({}, obj, { type })

reducer.CREATE_TASK = CREATE_TASK
reducer.createTask = (opts) => wrapWithType(CREATE_TASK, opts)

reducer.startResolveInput = (uid) => ({ type: START_RESOLVE_INPUT, uid })
reducer.successResolveInput = (uid, resolvedInput) => ({ type: SUCCESS_RESOLVE_INPUT, uid, resolvedInput })
reducer.SUCCESS_RESOLVE_INPUT = SUCCESS_RESOLVE_INPUT

reducer.startOperation = (uid) => ({ type: START_OPERATION, uid })
reducer.successOperation = (uid) => ({ type: SUCCESS_OPERATION, uid })
reducer.SUCCESS_OPERATION = SUCCESS_OPERATION

reducer.startResolveOutput = (uid) => ({ type: START_RESOLVE_OUTPUT, uid })
reducer.START_RESOLVE_INPUT = START_RESOLVE_INPUT
reducer.successResolveOutput = (uid, resolvedOutput) => ({ type: SUCCESS_RESOLVE_OUTPUT, uid, resolvedOutput })
reducer.SUCCESS_RESOLVE_OUTPUT = SUCCESS_RESOLVE_OUTPUT

reducer.startValidatingOutput = (uid) => ({ type: START_VALIDATING_OUTPUT, uid })
reducer.successValidatatingOutput = (uid) => ({ type: SUCCESS_VALIDATING_OUTPUT, uid })


module.exports = reducer
