// Stolen from https://stackoverflow.com/questions/56902517/how-can-i-copy-my-static-files-to-my-output-location-in-a-typescript-express-pro
import shell from 'shelljs'

const buildFolder = './dist/'

const folders = new Set(['./src/gql', './src/ABI'])

// Copy Folders
folders.forEach((folder) => {
    shell.cp('-R', folder, buildFolder)
})