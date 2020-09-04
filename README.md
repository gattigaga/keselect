# Keselect

Keselect is a zero dependencies improved selectbox that have feature to search the options.

* Easy to use
* Able to set the options from Ajax
* It's jQuery free

## Install

You can download it from:

https://github.com/gattigaga/keselect/releases

You can pick **keselect.min.css** and **keselect.min.js** from **dist** directory and use that like this.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Other code -->
    <link rel="stylesheet" href="./keselect.min.css" />
  </head>
  <body>
    <!-- Other code -->

    <script src="./keselect.min.js"></script>
  </body>
</html>
```

or

You can install it via NPM:

```bash
npm install keselect
```

And import that like this.

```javascript
import Keselect from "keselect";
import "keselect/dist/keselect.min.css";
```

## Example

[Basic](https://codesandbox.io/s/keselect-example-basic-wl5wk)

[Set options via Ajax](https://codesandbox.io/s/keselect-example-ajax-ryroy)

[onChange callback](https://codesandbox.io/s/keselect-example-onchange-khfk2)

## Options

| Key                   | Type                                                | Default Value | Description                                 |
|-----------------------|-----------------------------------------------------|---------------|---------------------------------------------|
| ```isDisabled```      | ```boolean```                                       | ```false```   | Toggle disable select functionality.        |
| ```onSearch```        | ```(keyword: string, setItems: Function) => void``` | ```null```    | Used to set options from Ajax result.       |
| ```onDropdownClose``` | ```() => void```                                    | ```null```    | Callback that called after dropdown closed. |
| ```onDropdownOpen```  | ```() => void```                                    | ```null```    | Callback that called after dropdown opened. |

## Methods

| Name                  | Type                              | Description                                                                   |
|-----------------------|-----------------------------------|-------------------------------------------------------------------------------|
| ```setValue```        | ```(value: string) => void```     | Set new value.                                                                |
| ```getValue```        | ```() => string```                | Get keselect's value.                                                         |
| ```destroy```         | ```() => void```                  | Destroy keselect's instance.                                                  |
| ```onChange```        | ```(callback: Function) => void```| Callback that be called when user change the value by clicking an option item.|

## Development

```npm start``` - to start development environment

```npm test``` - to test the project

```npm run build``` - to build project in production

## License

This project is licensed under the MIT License.

