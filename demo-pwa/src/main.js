import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
<h2>Week 2 — 23IT.B123 — Trương Minh Khánh Long</h2>

`

setupCounter(document.querySelector('#counter'))
