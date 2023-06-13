export default class Iconly {
	constructor(options) {
		this.options = { ...options }
		this.isLocalStorage = !!(window['localStorage'])
		this.body = document.body
		this.init().then()
	}

	async init() {
		const { file, revision } = this.options

		if (this.isLocalStorage && localStorage.getItem('inlineSVGrev') === revision) {
			const data = localStorage.getItem('inlineSVGdata')
			if (data) {
				this.insert(data)
				return
			}
		}

		try {
			const response = await fetch(file)

			if (!response.ok) {
				throw new Error('Network response was not ok')
			}

			const data = await response.text()
			this.insert(data)

			if (this.isLocalStorage) {
				localStorage.setItem('inlineSVGdata', data)
				localStorage.setItem('inlineSVGrev', revision)
			}
		} catch (error) {
			console.error('There was a problem with the network fetch operation:', error)
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