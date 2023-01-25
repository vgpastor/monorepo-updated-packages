import * as core from '@actions/core'
import {context} from '@actions/github'
const {exec} = require('child_process')

async function run(): Promise<void> {
  try {
    core.info('Action runs')
    core.debug('Action runs DEBUG')

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

    exec(
      `git diff --name-only ${base} ${head}`,
      (error: {message: any}, stdout: any, stderr: any) => {
        if (error) {
          core.error(`error: ${error.message}`)
          return
        }
        if (stderr) {
          core.error(`stderr: ${stderr}`)
          return
        }
        core.info(`Files exec:\n ${stdout}`)
        const files = stdout.split('\n')
        const projects = extractProjectFromFiles(files)
        core.info(`Projects updated: ${projects.join(', ')}`)
        core.setOutput('projects', projects)
        return files
      }
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function extractProjectFromFiles(files: string[]): string[] {
  const projects: string[] = []
  const folder = core.getInput('folder', {required: true})

  // files.forEach(file => {
  //   const paths = file.split('/')
  //   if (paths[0] === folder) {
  //     projects.push(paths[1])
  //   }
  // })

  for (let i = 0; i < files.length; i++) {
    const paths = files[i].split('/')
    if (paths[0] === folder) {
      projects.push(paths[1])
    }
  }
  return projects
}

run()
