import * as core from '@actions/core'
import {context} from '@actions/github'
import {GitClient} from './GitClient'
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

    const git = new GitClient()

    if (core.isDebug()) {
      core.debug('Git status')
      await git.getStatus(core)
    }

    core.info(`base: ${base}`)
    core.info(`head: ${head}`)

    const listOfFilesUpdated = await git.getDiff(base, head)

    core.info(`files updated: ${listOfFilesUpdated.length}`)
    for (const file of listOfFilesUpdated) {
      core.debug(`file updated: ${file}`)
    }
    // var projectsPath = core.getInput('folder', {required: true, trimWhitespace: true})
    const projectsPath = cleanProjectsPathEndSlash('example/sourceTest/')
    core.info(`projectsPath: ${projectsPath}`)
    core.setOutput(
      'packages',
      JSON.stringify(extractProjectFromFiles(projectsPath, listOfFilesUpdated))
    )

    return
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function extractProjectFromFiles(
  pathToProjects: string,
  listOfFiles: string[]
): string[] {
  const projects = new Set<string>()
  for (const file of listOfFiles) {
    if (!file.startsWith(pathToProjects)) {
      continue
    }
    const route = file.replace(pathToProjects, '')
    core.info(`route: ${route}`)
    const project = route.split('/')[0]
    projects.add(project)
  }
  return Array.from(projects)
}

function cleanProjectsPathEndSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

run()
