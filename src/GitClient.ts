import {DiffResult, simpleGit, SimpleGit, SimpleGitOptions} from 'simple-git'
import * as core from '@actions/core'

class GitClient {
  git: SimpleGit
  path: string = process.cwd()

  constructor() {
    const options: Partial<SimpleGitOptions> = {
      baseDir: this.path,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false
      // config:['safe.directory='+path]
    }

    this.git = simpleGit(options)
    this.enableSecurePath()
  }

  private enableSecurePath() {
    const commands = [
      'config',
      '--global',
      '--add',
      'safe.directory',
      this.path
    ]
    this.git.raw(commands, (err, result) => {
      // console.log(result)
    })
  }

  public async getStatus(core: typeof import('@actions/core')) {
    core.debug('Getting status')
    return await this.git.status((err, status) => {
      if (!err) {
        core.debug(status.current ? status.current : 'EMPTY')
      } else {
        core.error(err.message)
      }
    })
  }

  public async getDiff(base: string, head: string) {
    const out = await this.git.diffSummary(['--name-only', base, head])
    return this.flatOutputDiff(out)
  }

  private flatOutputDiff(result: DiffResult) {
    var listOfFiles: string[] = []
    for (const file of result.files) {
      listOfFiles.push(file.file)
    }
    return listOfFiles
  }
}
export {GitClient}
