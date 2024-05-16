This repository is an opinionated verison of the dx@scale template. It's to be used in github and is shipped with a devcontainer installed with all the dependencies.

The rest of this readme comes from the dx@scale template.

## Development

This project is using a scratch org development model. In order to contribute you will need to create a scratch org with and push all metadata configuration and code.

## Dependencies

- sfp cli
- sf cli

`npm i @salesforce/cli @flxblio/sfp`

## Scratch Org Setup

For this you will need to be authenticated to a Dev Hub org - this is typically the Production Org

- Authenticate to the DevHub (Production Org)

  You need to perform this step only once

  ```
   sf org login device --setalias devhub
  ```

- Clone the repository

- There are two options: fetch a scratch org with package dependencies pre-installed, or create an empty scratch org

  - Option A: Fetch a scratch org from the pool [Preferred]

    ```

    sfp pool fetch -t dev -a  <alias>
    ```

  - Option B: Create a scratch org and install all dependencies

    ```
    sf org create --definitionfile config/project-scratch-def.json --setalias <myScratchOrg> --targetdevhubusername <devhub-alias>
    sfp dependency install -o <myScratchOrg> -v <devhub-alias>

    Push the source code
    sf deploy metadata -o <myScratchOrg>

    ```
