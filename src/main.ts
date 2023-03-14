import * as core from '@actions/core'
import {context} from '@actions/github'
import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
  config:['safe.directory='+process.cwd()]
};

const git: SimpleGit = simpleGit(options);
const commands = ['config', '--global', '--add', 'safe.directory', process.cwd()];

// using an array of commands and node-style callback
git.raw(commands, (err, result) => {
  // console.log(result)
});

async function run(): Promise<void> {
  try {
    const cwd = process.cwd();
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
    core.info(`Base: ${base}`)
    base = "0cf252834ca881794e6ce24e4bd803df6c973d0b"
    core.info(`Head: ${head}`)
    head = "8ef64a7929361e120f278be6ff34460d0ca3bb92"

    // git.status()
    //     .then((status) => {
    //       console.log(status)
    //     })
    //     .catch((err) => {
    //       console.error(err)
    //     });


    core.info(`diff: `+base+'->'+head);

    const out = await git.diffSummary(['--name-only', base, head])
    // const out = await git.diffSummary(['--name-only'])

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
