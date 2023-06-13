<div align="center">
<br>

<h1>iconly</h1>

[![npm](https://img.shields.io/npm/v/iconly.svg?colorB=brightgreen)](https://www.npmjs.com/package/iconly)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/iconly.svg)](https://github.com/ux-ui-pro/iconly)
[![NPM Downloads](https://img.shields.io/npm/dm/iconly.svg?style=flat)](https://www.npmjs.org/package/iconly)

<sup><a href="https://bundlephobia.com/package/iconly">500B gzipped</a></sup>
<h3><a href="https://codepen.io/ux-ui/pen/zYmyqWR">Demo</a></h3>

</div>
<br>

### Import
```javascript
import Iconly from 'iconly'
```

```javascript
new Iconly({
	revision: '1',
	file: './sprite.svg'
})
```
<br>

### File with icons
<sub>sprite.svg</sub>

```HTML
<svg id="iconset" aria-hidden="true" style="width: 0; height: 0; position: absolute;">
	<symbol id="icon-one" viewBox="0 0 100 100">
		<path ... />
	</symbol>
	<symbol id="icon-two" viewBox="0 0 100 100">
		<path ... />
	</symbol>
	...
</svg>
```
<br>

### Usage
```HTML
<svg>
	<use xlink:href="#icon-name"></use>
</svg>
```
<br>

### License
<sup>iconly is released under MIT license</sup>