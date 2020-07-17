import '@snackbar/core/dist/snackbar.css'

import './styles/_global.scss'
import './styles/_style.scss'
import './styles/_media.scss'

import './styles/_cards.scss'
import './styles/_button.scss'
import './styles/_fields.scss'
import './styles/_growl.scss'
import './styles/_logo.scss'

require('./assets/images/logo.png')
require('./assets/images/bank.png')
require('./assets/images/shield.svg')

import App from "./scripts/app"
document.addEventListener('DOMContentLoaded', () => new App())
