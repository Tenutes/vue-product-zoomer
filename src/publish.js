import Zoomer from './components/ProductZoomer'

const ProductZoomer = {
  install(app) {
    app.component(Zoomer.name, Zoomer)
  }
}

export default ProductZoomer
