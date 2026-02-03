import { createSSRApp } from 'vue'
import App from './App.vue'
import uviewPlus from 'uview-plus'

export function createApp() {
    const app = createSSRApp(App)

    // Explicitly initialize uni.$u to avoid issues in early lifecycle of mixins
    uni.$u = {}

    app.use(uviewPlus)

    return {
        app
    }
}
