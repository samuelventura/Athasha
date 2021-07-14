
const devURL = "ws://localhost:5001/ws/index";
const prodURL = process.env.PUBLIC_URL + "/ws/index";

const isDev = process.env.NODE_ENV === 'development';

let logEnabled = isDev;

const wsURL = isDev ? devURL : prodURL;

function log(...args) {
  if (logEnabled) {
    console.log(...args);
  }
}

function enableLog(enable) {
  logEnabled = enable;
}

const environ = {isDev, wsURL, enableLog, log};

export default environ;
