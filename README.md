<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Detect projects updated in a monorepo

If you have a monorepo with multiple projects, you can use this action to detect which projects have been updated in a pull request. This is useful for CI/CD workflows that need to run only on the projects that have been updated.

Save money by only running CI/CD workflows on the projects that have been updated.

Save time optimizing your CI/CD workflows.

## Usage



## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)


## Usage

This actions wait that you store all projects inside the same folder. Then you can pass the path to this folder as an input parameter.

- src
  - project1
  - project2
  - project3

Execute the action

```yaml
-id: updated-packages
 uses: vgpastor/monorepo-updated-packages@v1
  with:
    folder: PATH TO PROJECTS FOLDER
```

Pass the output to another action or a matrix

```yaml
- name: Message with projects updated
  run: echo "Projects updated ${{ steps.updated-packages.projects }}"
```

```yaml
- name: Run tests
  run: |
    for project in ${{ steps.updated-packages.projects }}
    do
      echo "Running tests for $project"
      cd $project
      npm install
      npm test
    done
```

```yaml
 strategy:
    matrix:
      project: ${{ steps.updated-packages.projects }}
    steps:
        - name: Run tests
            run: |
            echo "Running tests for ${{ matrix.project }}"
            cd ${{ matrix.project }}
            npm install
            npm test
```
