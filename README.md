<div align="center">
<br>

<h1>iconly</h1>

<p><sup>Iconly is designed to load and cache SVG icons in the browser, using IndexedDB to store the data. It retrieves the icons from a given SVG file, stores them in IndexedDB, and inserts them into the DOM for easy access and use.</sup></p>

[![npm](https://img.shields.io/npm/v/iconly.svg?colorB=brightgreen)](https://www.npmjs.com/package/iconly)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/iconly.svg)](https://github.com/ux-ui-pro/iconly)
[![NPM Downloads](https://img.shields.io/npm/dm/iconly.svg?style=flat)](https://www.npmjs.org/package/iconly)

<sup>1.5kB gzipped</sup>

<a href="https://codepen.io/ux-ui/pen/zYmyqWR">Demo</a>

</div>
<br>

&#10148; **Install**

```console
$ yarn add iconly
```
<br>

&#10148; **Import**

```javascript
import Iconly from 'iconly';
```
<br>

&#10148; **Usage**

```javascript
const iconly = new Iconly({
  file: './sprite.svg',
  version: '1.0',
  debug: true,
});

iconly.init().then(() => console.log('Iconly is initialized and icons are loaded.'));
```

```HTML
<svg>
  <use href="#icon-name"></use>
</svg>
```
<sub>File with icons</sub>
```HTML
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" fill="none">
  <symbol id="icon-name" viewBox="0 0 300 300">
    <path ... />
  </symbol>
  ...
</svg>
```
<br>

&#10148; **Options**

|   Option    |          Type           |     Default     | Description                                                                                             |
|:-----------:|:-----------------------:|:---------------:|:--------------------------------------------------------------------------------------------------------|
|   `file`    |        `string`         | `'./icons.svg'` | The URL of the SVG file containing the icons.                                                           |
|  `version`  |        `string`         |     `'1.0'`     | The version of the icon set.                                                                            |
|   `debug`   |        `boolean`        |     `false`     | If `true`, debug information and errors will be logged to the console.                                  |
| `container` | `string \| HTMLElement` | `document.body` | The container element where the icons will be injected. Can be a CSS selector string or an HTMLElement. |
<br>

&#10148; **License**

iconly is released under MIT license
