import * as simpleGit from 'simple-git'
import * as core from '@actions/core'

class GitClient {
  git: simpleGit.SimpleGit
  path: string = process.cwd()

  constructor() {
    const options: Partial<simpleGit.SimpleGitOptions> = {
      baseDir: this.path,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false
      // config:['safe.directory='+path]
    }

    this.git = simpleGit.simpleGit(options)
    this.enableSecurePath()
  }

  private enableSecurePath(): void {
    const commands = [
      'config',
      '--global',
      '--add',
      'safe.directory',
      this.path
    ]
    this.git.raw(commands, (err, result) => {
      core.info(`Fetching all-> + ${result}`)
      if (err) {
        core.error(err.message)
      }
    })
  }

  async fetchAll(): Promise<void> {
    await this.git.raw(['fetch', '--all'], err => {
      if (err) {
        core.error(err.message)
      }
    })
  }
  async getStatus(): Promise<simpleGit.StatusResult> {
    core.debug('Getting status')
    return this.git.status((err, status) => {
      if (!err) {
        core.debug(status.current ? status.current : 'EMPTY')
      } else {
        core.error(err.message)
      }
      if (status.current) {
        core.debug(`Current branch: ${status.current}`)
      }
      if (status.tracking) {
        core.debug(`Tracking branch: ${status.tracking}`)
      }
    })
  }

  async getDiff(base: string, head: string): Promise<string[]> {
    const out = await this.git.diffSummary(['--name-only', base, head])
    return this.flatOutputDiff(out)
  }

  async createBranch(
    branchName: string,
    base: string,
    force: boolean
  ): Promise<void> {
    if (force) {
      //Delete branch
      await this.git.raw(['branch', '-D', branchName], (err, result) => {
        if (err) {
          core.error(err.message)
        }
        core.info(`Branch deleted: ${result}`)
      })
    }

    await this.git.raw(['branch', branchName, base], (err, result) => {
      if (err) {
        core.error(err.message)
      }
      core.info(`Branch created: ${result}`)
    })
  }

  private flatOutputDiff(result: simpleGit.DiffResult): string[] {
    const listOfFiles: string[] = []
    for (const file of result.files) {
      listOfFiles.push(file.file)
    }
    return listOfFiles
  }
}
export {GitClient}
