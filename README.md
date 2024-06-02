<div align="center">
<br>

<h1>iconly</h1>

<p><sup>Iconly is designed to load and cache SVG icons in the browser, using IndexedDB to store the data. It retrieves the icons from a given SVG file, stores them in IndexedDB, and inserts them into the DOM for easy access and use.</sup></p>

[![npm](https://img.shields.io/npm/v/iconly.svg?colorB=brightgreen)](https://www.npmjs.com/package/iconly)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/iconly.svg)](https://github.com/ux-ui-pro/iconly)
[![NPM Downloads](https://img.shields.io/npm/dm/iconly.svg?style=flat)](https://www.npmjs.org/package/iconly)

<sup>1kB gzipped</sup>

<a href="https://codepen.io/ux-ui/pen/zYmyqWR">Demo</a>

</div>
<br>

&#10148; **Installation**

```console
$ yarn add iconly
```
<br>

&#10148; **Import**

```javascript
import Iconly from 'iconly';
```

```javascript
const iconly = new Iconly({
  file: './sprite.svg',
  version: '1.0',
  debug: true,
});

iconly.init().then(() => console.log('Iconly is initialized and icons are loaded.'));
```
<br>

&#10148; **File with icons**

```HTML
<svg>
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

&#10148; **Usage**

```HTML
<svg>
  <use href="#icon-name"></use>
</svg>
```
<br>

&#10148; **License**

iconly is released under MIT license
