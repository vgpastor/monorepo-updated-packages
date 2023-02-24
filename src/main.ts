import * as core from '@actions/core'
import {context} from '@actions/github'
import {simpleGit} from 'simple-git'
async function run(): Promise<void> {
  try {
    core.info('Action runs')
    core.debug('Action runs DEBUG')

    let base = ''
    let head = ''

    core.info(`Action runs ${context.eventName}`)
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

    const out = await simpleGit().diffSummary(['--name-only', base, head])
    core.info(`files updated: ${out.changed}`)
    core.setOutput('packages', JSON.stringify(out.files))

    return
    // core.info(`Files exec:\n ${out}`)
    // const files = out.split('\n')
    // const projects = extractProjectFromFiles(files)
    // core.info(`packages updated: ${projects.join(', ')}`)
    // core.setOutput('packages', JSON.stringify(projects))
    // return files

    // const eRes = exec(
    //   `git diff --name-only ${base} ${head}`,
    //   (error: ExecException | null, stdout: string, stderr: string) => {
    //     if (error) {
    //       core.error(`exec error: ${error.message}`)
    //       core.setFailed(`exec error: ${error.message}`)
    //       return
    //     }
    //     if (stderr) {
    //       core.error(`exec stderr: ${stderr}`)
    //       core.setFailed(`exec stderr: ${stderr}`)
    //       return
    //     }
    //     core.info(`Files exec:\n ${stdout}`)
    //     const files = stdout.split('\n')
    //     const projects = extractProjectFromFiles(files)
    //     core.info(`packages updated: ${projects.join(', ')}`)
    //     core.setOutput('packages', JSON.stringify(projects))
    //     return files
    //   }
    // )
    // core.info(`PID ${eRes.pid}`)
    // core.info(`Status ${eRes.s}`)
    // core.info(`Signal ${eRes.signalCode}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
run()
