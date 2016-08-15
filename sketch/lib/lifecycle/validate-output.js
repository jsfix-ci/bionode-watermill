'use strict'

const {
  isNonNull,
  matchHash,
  matchTime
} = require('../validators')
const applicator = require('../utils/applicator.js')

const { CHECKING_RESUMABLE } = require('../constants/task-status-types.js')

const dispatch = ({ content }) => console.log(content)
const TASK_LOG = 'sdsd'
const SET_VALIDATION = 'sdsds'
const uid = 'sdsd'
const tab = () => ''
const mode = 'sdsds'

const validateOutput = (taskState) => new Promise((resolve, reject) => {
  dispatch({
    type: TASK_LOG,
    uid,
    content: tab(1) + 'Running validations'
  })

  const { resolvedOutput, status } = taskState

  const validArr = [
    applicator(resolvedOutput, isNonNull)
  ]
  // TODO
  if (mode === 'before') {
    validArr.push(applicator(resolvedOutput, matchHash))
    validArr.push(applicator(resolvedOutput, matchTime))
  }

  const validations = Promise.all(validArr)

  // TODO dispatch something to store validations output

  validations
  .then(() => {
    console.log('validations ran')
    if (status === CHECKING_RESUMABLE) {
      dispatch({
        type: TASK_LOG,
        uid,
        content: tab(1) + 'All validations successful'
      })
    }

    // dispatch({
    //   type: SET_VALIDATION,
    //   uid,
    //   value: true
    // })

    if (mode === 'after') {
      const checksummer = require('../post-validators/checksummer.js')
      return applicator(resolvedOutput, checksummer)
        .then(() => console.log('  ' + 'Wrote output(s) time+hash to waterwheel.json'))
    }
  })
  .catch((err) => {
    // dispatch({
    //   type: SET_VALIDATION,
    //   uid,
    //   value: false
    // })

    dispatch({
      type: TASK_LOG,
      uid,
      content: tab(2) + err
    })

    dispatch({
      type: TASK_LOG,
      uid,
      content: tab(1) + 'Could not resolve output before running'
    })
  })
  .then(() => resolve( {
    validated: true,
    validations: {}
  }))
})

module.exports = validateOutput
