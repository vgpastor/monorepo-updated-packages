import * as core from '@actions/core'
import {context} from '@actions/github'
import GithubApi from './infrastructure/githubApi'

async function run(): Promise<void> {
  try {
    const folder = core.getInput('folder', {required: true})

    const githubApi = new GithubApi(core.getInput('token', {required: true}))

    // Define the base and head commits to be extracted from the payload.
    let base = ''
    let head = ''

    switch (context.eventName) {
      case 'pull_request':
        base = context.payload.pull_request?.base?.sha
        head = context.payload.pull_request?.head?.sha
        break
      case 'push':
        base = context.payload.before
        head = context.payload.after
        break
      default:
        core.setFailed(
          `This action only supports pull requests and pushes, ${context.eventName} events are not supported. ` +
            "Please submit an issue on this action's GitHub repo if you believe this in correct."
        )
    }

    let filesModified = githubApi.getModifiedFiles(base, head)

    filesModified.then(files => {
      core.info(`Files modified: ${files}`)
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
