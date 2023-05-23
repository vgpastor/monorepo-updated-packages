import * as core from '@actions/core'
import {context} from '@actions/github'
import {GitClient} from './git-client'
import {FindCommits} from './findCommits'
import {json} from 'stream/consumers'

const findCommits = new FindCommits()
const git = new GitClient()

async function run(): Promise<void> {
  try {
    await git.fetchAll()

    const status = await git.getStatus()
    core.debug(`GIT STATUS: ${JSON.stringify(status)}`)

    const updatedCommits = findCommits.find(context, status)
    if (updatedCommits == null) {
      core.error('No updated commits found')
      return
    }

    core.info(`base: ${updatedCommits.base}`)
    core.info(`head: ${updatedCommits.head}`)

    // await git.createBranch('testDiff', updatedCommits.base, true)

    //git branch testDiff updatedCommits.head
    //git diff --name-only testDiff updatedCommits.base

    if (core.isDebug()) {
      core.debug('Git status')
    }

    const listOfFilesUpdated = await git.getDiff(
      updatedCommits.base,
      updatedCommits.head
    )

    core.info(`files updated: ${listOfFilesUpdated.length}`)
    for (const file of listOfFilesUpdated) {
      core.debug(`file updated: ${file}`)
    }
    const projectsPath = cleanProjectsPathEndSlash(
      core.getInput('folder', {required: true, trimWhitespace: true})
    )
    core.info(`packages Path: ${projectsPath}`)
    core.debug(
      `packages updated: ${extractProjectFromFiles(
        projectsPath,
        listOfFilesUpdated
      )}`
    )
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

// if (core.isDebug()) {
//   core.debug('Git status')
//   git.getStatus().then(r => {
//     core.info("Status: "+r.current)
//   })
// }

run()
