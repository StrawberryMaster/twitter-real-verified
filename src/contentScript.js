import { validateBrowserAPI as browserAPI } from './utils/validateUserBrowser'
import { LOCAL_STORAGE, CONFIG_REQUEST } from './constants'

function loadScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = browserAPI().runtime.getURL(scriptPath)
    script.onload = () => {
      script.remove()
      resolve()
    }
    script.onerror = () => {
      script.remove()
      reject(new Error(`Failed to load script: ${scriptPath}`))
    }
    document.head.appendChild(script)
  })
}

async function loadAllScripts() {
  const scripts = ['verifiedUserList1.js', 'verifiedUserList2.js', 'script.js']
  
  try {
    await Promise.all(scripts.map(script => loadScript(script)))
    console.log('All scripts loaded successfully')
  } catch (error) {
    console.error('Error loading scripts:', error)
  }
}

loadAllScripts()

browserAPI().runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request[CONFIG_REQUEST.SAVE]) {
        await saveChanges(request[CONFIG_REQUEST.SAVE])
        sendResponse({ 
          status: true, 
          content: request[CONFIG_REQUEST.SAVE], 
          message: 'Settings saved successfully' 
        })
      }
      
      if (request[CONFIG_REQUEST.LOAD]) {
        const config = loadConfig()
        sendResponse({ 
          status: true, 
          content: config, 
          message: config ? 'Config loaded successfully' : 'No saved data found' 
        })
      }
    } catch (error) {
      console.error('Error processing message:', error)
      sendResponse({ 
        status: false, 
        content: null, 
        message: 'Error processing request',
        error: error.message 
      })
    }
  })()
  
  return true
})

function loadConfig() {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE)
    return storedData ? JSON.parse(storedData) : null
  } catch (error) {
    console.error('Error parsing stored config:', error)
    return null
  }
}

async function saveChanges(configValues) {
  try {
    const serializedConfig = JSON.stringify(configValues)
    localStorage.setItem(LOCAL_STORAGE, serializedConfig)
    console.log('Configuration saved successfully')
  } catch (error) {
    console.error('Error saving configuration:', error)
    throw error
  }
}
