import * as core from '@actions/core'
import {context} from '@actions/github'
import GithubApi from './infrastructure/githuba-api'
const { exec } = require("child_process");

async function run(): Promise<void> {
  try {
      core.debug("Action runs");
      core.info("Action runs INFO");
        core.error("Action runs ERROR");
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

    exec(`git diff --name-only ${base} ${head}`, (error: { message: any; }, stdout: any, stderr: any) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    // Execute command in a child process
    // const { stdout, stderr } = await exec('git diff --name-only ${base} ${head}');



    // eslint-disable-next-line github/no-then
    // const filesModified = await githubApi
    //   .getModifiedFiles(base, head)
    //   .then(files => {
    //     core.info(`Files modified: ${files}`)
    //     // return files
    //   })

    // filesModified.then(files => {
    //   core.info(`Files modified: ${files}`)
    // })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
