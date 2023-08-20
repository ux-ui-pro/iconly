export default class Iconly {
	constructor(options) {
		this.options = { ...options }
		this.isLocalStorage = !!(window['localStorage'])
		this.body = document.body

		this.init().then()
	}

	async init() {
		const { file } = this.options

		if (document.querySelector('#iconset')) return

		if (this.isLocalStorage) {
			const storedSize = localStorage.getItem('inlineSVGsize')

			try {
				const response = await fetch(file)

				if (!response.ok) throw new Error('Network response was not ok')

				const data = await response.text()

				if (storedSize && storedSize === data.length.toString()) {
					this.insert(localStorage.getItem('inlineSVGdata'))
				} else {
					this.insert(data)

					localStorage.setItem('inlineSVGdata', data)
					localStorage.setItem('inlineSVGsize', data.length.toString())
				}
			} catch (error) {
				console.error('There was a problem with the network fetch operation:', error)
			}
		} else {
			try {
				const response = await fetch(file)

				if (!response.ok) throw new Error('Network response was not ok')

				const data = await response.text()

				this.insert(data)
			} catch (error) {
				console.error('There was a problem with the network fetch operation:', error)
			}
		}
	}

	insert(data) {
		if (this.body) {
			this.body.insertAdjacentHTML('beforeend', data)
		} else {
			document.addEventListener('DOMContentLoaded', () => {
				this.body.insertAdjacentHTML('beforeend', data)
			})
		}
	}
}