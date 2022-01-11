import { createApp } from 'vue'
import 'bulma/css/bulma.css'
import ProductZoomer from "../dist/assets/js/app.bundle.js";
import App from './App'
const app = createApp(App);

app.use(ProductZoomer)
app.mount('#app')
