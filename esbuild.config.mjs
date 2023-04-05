import * as esbuild from 'esbuild'
import { copySync } from 'fs-extra/esm'
import chokidar from 'chokidar'

const CHROMEOUTPUT = './chrome-extension'
const FIREFOXOUTPUT = './firefox-extension'

const files = [
  { out: 'popup/popup', in: './src/popup/popup.html' },
  { out: 'popup/popup', in: './src/popup/popup.css' },
  { out: 'popup/popup', in: './src/popup/popup.js' },
  { out: 'popup/jscolor.min', in: './src/popup/jscolor.min.js' },
  { out: 'contentScript', in: './src/contentScript.js' },
  { out: 'background', in: './src/background.js' },
  { out: 'script', in: './src/script.js' }
]

const chromeBuild = async () => {
  await esbuild.build({
    entryPoints: files,
    bundle: true,
    outdir: CHROMEOUTPUT,
    loader: { '.html': 'copy' }
  }).then(() => {
    copySync('./assets', `${CHROMEOUTPUT}/assets`)
    copySync('./manifestV3.json', `${CHROMEOUTPUT}/manifest.json`)
  }).catch(error => {
    console.log('Build failed in ChromeBuild:' + error)
  })
}

const firefoxBuild = async () => {
  await esbuild.build({
    entryPoints: files,
    bundle: true,
    outdir: FIREFOXOUTPUT,
    loader: { '.html': 'copy' }
  }).then(() => {
    copySync('./assets', `${FIREFOXOUTPUT}/assets`)
    copySync('./manifestV2.json', `${FIREFOXOUTPUT}/manifest.json`)
  }).catch(error => {
    console.log('Build failed in FirefoxBuild:' + error)
  })
}

const filesToWatch = ['src', 'manifestV2.json', 'manifestV3.json']
chokidar.watch(filesToWatch)
  .on('all', (event, path) => {
    firefoxBuild()
    chromeBuild()
    console.log(`${event}: ${path}`)
  })